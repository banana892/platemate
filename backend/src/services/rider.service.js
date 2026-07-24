/**
 * rider.service.js — Business Logic for Delivery Partner (Phase 7)
 *
 * This layer owns ALL business logic. It calls repositories for data
 * and throws ApiErrors for rule violations. Controllers stay thin.
 *
 * Key Business Rules Enforced Here:
 *   - Only approved riders can go ONLINE
 *   - BUSY riders cannot receive new deliveries
 *   - One active delivery at a time (enforced on status transitions)
 *   - Only the assigned rider can update delivery status
 *   - Reject invalid status transitions
 *   - DELIVERED orders are immutable (history)
 *
 * Rider Delivery State Machine:
 *   READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
 */

import * as riderRepo from '../repositories/rider.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

// ── Delivery status state machine ─────────────────────────────────────────────

const VALID_RIDER_TRANSITIONS = {
  READY_FOR_PICKUP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  // All other statuses are not rideable (restaurant handles them)
}

// ── Date range helper ─────────────────────────────────────────────────────────

const getDateRange = (range, startDate, endDate) => {
  const now = new Date()
  const end = new Date()
  const start = new Date()

  if (range === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (range === 'week') {
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (range === 'month') {
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (range === 'custom') {
    return {
      start: new Date(startDate),
      end: new Date(endDate),
    }
  }

  return { start, end, now }
}

// ── Internal helper: resolve & guard rider ────────────────────────────────────

/**
 * Resolves the DeliveryPartner record for a user, throws if not found.
 * Does NOT require isApproved — profile/status reads are always allowed.
 */
const resolveRider = async (userId) => {
  const rider = await riderRepo.findDeliveryPartnerByUserId(userId)
  if (!rider) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOT_FOUND)
  }
  return rider
}

/**
 * Resolves rider AND asserts they are approved.
 * Used for any action that has operational consequences (going ONLINE, etc.)
 */
const resolveApprovedRider = async (userId) => {
  const rider = await resolveRider(userId)
  if (!rider.isApproved) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.RIDER_NOT_APPROVED)
  }
  return rider
}

// ── Profile formatting helper ─────────────────────────────────────────────────

const formatProfile = (rider) => ({
  id: rider.id,
  userId: rider.userId,
  name: rider.user.name,
  email: rider.user.email,
  phone: rider.user.phone,
  avatar: rider.user.avatar,
  vehicleType: rider.vehicleType,
  vehicleNumber: rider.vehicleNumber,
  licenseNumber: rider.licenseNumber,
  isAvailable: rider.isAvailable,
  isApproved: rider.isApproved,
  totalDeliveries: rider.totalDeliveries,
  averageRating: Number(rider.averageRating),
  currentLocation:
    rider.currentLatitude && rider.currentLongitude
      ? {
          latitude: Number(rider.currentLatitude),
          longitude: Number(rider.currentLongitude),
        }
      : null,
  settings: rider.settings
    ? {
        riderStatus: rider.settings.riderStatus,
        emergencyContact: rider.settings.emergencyContact,
        earningsPerDelivery: Number(rider.settings.earningsPerDelivery),
        bonusEarnings: Number(rider.settings.bonusEarnings),
      }
    : null,
  createdAt: rider.createdAt,
  updatedAt: rider.updatedAt,
})

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboard = async (userId) => {
  const rider = await resolveRider(userId)
  const riderId = rider.id

  // Ensure settings exist (lazy init)
  const settings = await riderRepo.findOrCreateRiderSettings(riderId)

  // Date ranges
  const now = new Date()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(monthStart.getDate() - 30)
  monthStart.setHours(0, 0, 0, 0)

  // Active orders (READY_FOR_PICKUP, OUT_FOR_DELIVERY)
  const { orders: activeOrders } = await riderRepo.findActiveOrders(riderId, { take: 100 })

  // Recent deliveries (history preview)
  const { orders: recentHistory } = await riderRepo.findDeliveryHistory(riderId, { take: 5 })

  // Monthly delivered orders for earnings
  const monthlyDelivered = await riderRepo.findOrdersInRange(riderId, monthStart, now)
  const weeklyDelivered = monthlyDelivered.filter((o) => new Date(o.deliveredAt) >= weekStart)
  const todayDelivered = monthlyDelivered.filter(
    (o) => new Date(o.deliveredAt) >= todayStart && new Date(o.deliveredAt) <= todayEnd
  )

  // Earnings: deliveryFee per completed delivery + bonus
  const calcEarnings = (orders) =>
    orders.reduce((sum, o) => sum + Number(o.deliveryFee), 0) + Number(settings.bonusEarnings || 0)

  const todayEarnings = todayDelivered.reduce((sum, o) => sum + Number(o.deliveryFee), 0)
  const weeklyEarnings = weeklyDelivered.reduce((sum, o) => sum + Number(o.deliveryFee), 0)
  const monthlyEarnings = monthlyDelivered.reduce((sum, o) => sum + Number(o.deliveryFee), 0)

  // Count active delivery states
  const pendingCount = activeOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length
  const inProgressCount = activeOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length

  return {
    onlineStatus: settings.riderStatus,
    isApproved: rider.isApproved,
    averageRating: Number(rider.averageRating),
    totalDeliveries: rider.totalDeliveries,
    todayStats: {
      deliveriesCompleted: todayDelivered.length,
      earnings: parseFloat(todayEarnings.toFixed(2)),
    },
    weeklyStats: {
      deliveriesCompleted: weeklyDelivered.length,
      earnings: parseFloat(weeklyEarnings.toFixed(2)),
    },
    monthlyStats: {
      deliveriesCompleted: monthlyDelivered.length,
      earnings: parseFloat(monthlyEarnings.toFixed(2)),
    },
    activeDeliveries: {
      assigned: pendingCount,
      inProgress: inProgressCount,
    },
    recentDeliveries: recentHistory.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      restaurantName: o.restaurant?.name,
      customerName: o.user?.name,
      deliveryFee: Number(o.deliveryFee),
      totalAmount: Number(o.totalAmount),
      deliveredAt: o.deliveredAt,
      status: o.status,
    })),
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  const rider = await resolveRider(userId)
  // Ensure settings are always present
  if (!rider.settings) {
    await riderRepo.findOrCreateRiderSettings(rider.id)
    // Re-fetch with settings
    const fresh = await riderRepo.findDeliveryPartnerByUserId(userId)
    return formatProfile(fresh)
  }
  return formatProfile(rider)
}

export const updateProfile = async (userId, data) => {
  const rider = await resolveRider(userId)
  const { emergencyContact, ...partnerData } = data

  // Update DeliveryPartner + User via transaction
  await riderRepo.updateRiderProfile(rider.id, userId, partnerData)

  // Update settings (emergencyContact) if provided
  if (emergencyContact !== undefined) {
    await riderRepo.updateRiderSettings(rider.id, { emergencyContact })
  }

  // Re-fetch and return fresh profile
  return getProfile(userId)
}

// ── Availability Status ───────────────────────────────────────────────────────

export const getRiderStatus = async (userId) => {
  const rider = await resolveRider(userId)
  const settings = await riderRepo.findOrCreateRiderSettings(rider.id)

  return {
    riderId: rider.id,
    riderStatus: settings.riderStatus,
    isAvailable: rider.isAvailable,
    isApproved: rider.isApproved,
  }
}

export const updateRiderStatus = async (userId, status) => {
  const rider = await resolveRider(userId)

  // Only approved riders can go ONLINE
  if (status === 'ONLINE' && !rider.isApproved) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.RIDER_NOT_APPROVED)
  }

  // Update settings status
  const settings = await riderRepo.updateRiderSettings(rider.id, { riderStatus: status })

  // Keep isAvailable on DeliveryPartner in sync
  // ONLINE → isAvailable = true; all others → isAvailable = false
  const isAvailable = status === 'ONLINE'
  await riderRepo.updateRiderProfile(rider.id, userId, {})
  // Direct DB update for isAvailable (not part of the profile fields)
  const { default: prisma } = await import('../config/db.js')
  await prisma.deliveryPartner.update({
    where: { id: rider.id },
    data: { isAvailable },
  })

  return {
    riderId: rider.id,
    riderStatus: settings.riderStatus,
    isAvailable,
  }
}

// ── Active Deliveries ─────────────────────────────────────────────────────────

export const getActiveOrders = async (userId, query) => {
  const rider = await resolveRider(userId)
  const { skip, take, page, limit } = parsePagination(query)
  const { status, sortBy = 'createdAt', order = 'desc' } = query

  const { orders, total } = await riderRepo.findActiveOrders(rider.id, {
    status,
    skip,
    take,
    sortBy,
    order,
  })

  return {
    orders: orders.map(formatOrderSummary),
    pagination: buildMeta(total, page, limit),
  }
}

export const getOrderById = async (userId, orderId) => {
  const rider = await resolveRider(userId)
  const order = await riderRepo.findOrderByIdForRider(orderId, rider.id)

  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_ORDER_NOT_FOUND)
  }

  return formatOrderDetail(order)
}

// ── Delivery Status Update ─────────────────────────────────────────────────────

export const updateDeliveryStatus = async (userId, orderId, status) => {
  const rider = await resolveApprovedRider(userId)

  // 1. Find the order and assert ownership
  const order = await riderRepo.findOrderByIdForRider(orderId, rider.id)
  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_ORDER_NOT_FOUND)
  }

  // 2. Enforce state machine
  const allowedNext = VALID_RIDER_TRANSITIONS[order.status]
  if (!allowedNext || !allowedNext.includes(status)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `${MSG.INVALID_STATUS_TRANSITION} Cannot transition from ${order.status} to ${status}.`
    )
  }

  // 3. Perform update
  const updated = await riderRepo.updateOrderStatus(orderId, rider.id, status)

  // Real-time Events
  const { emitToUser, emitToRider, emitToRestaurant, emitToAdmins } = await import('../socket/socket.events.js')
  const { EVENTS } = await import('../socket/socket.constants.js')

  emitToUser(order.userId, EVENTS.ORDER_UPDATED, {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    updatedAt: updated.updatedAt,
  })

  emitToRider(rider.id, EVENTS.RIDER_DELIVERY_UPDATED, {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    updatedAt: updated.updatedAt,
  })

  if (status === 'DELIVERED') {
    emitToRestaurant(order.restaurantId, EVENTS.RESTAURANT_ORDER_UPDATED, {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      updatedAt: updated.updatedAt,
    })

    emitToAdmins(EVENTS.ADMIN_DASHBOARD_REFRESH, {
      orderId: updated.id,
      timestamp: new Date().toISOString(),
    })
  }

  return {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    deliveredAt: updated.deliveredAt,
    updatedAt: updated.updatedAt,
  }
}

// ── Delivery History ───────────────────────────────────────────────────────────

export const getDeliveryHistory = async (userId, query) => {
  const rider = await resolveRider(userId)
  const { skip, take, page, limit } = parsePagination(query)
  const { startDate, endDate, search, sortBy = 'createdAt', order = 'desc' } = query

  const { orders, total } = await riderRepo.findDeliveryHistory(rider.id, {
    startDate,
    endDate,
    search,
    skip,
    take,
    sortBy,
    order,
  })

  return {
    deliveries: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      restaurantName: o.restaurant?.name,
      restaurantCity: o.restaurant?.city,
      customerName: o.user?.name,
      deliveryAddress: o.deliveryAddress,
      deliveryFee: Number(o.deliveryFee),
      totalAmount: Number(o.totalAmount),
      status: o.status,
      deliveredAt: o.deliveredAt,
      createdAt: o.createdAt,
    })),
    pagination: buildMeta(total, page, limit),
  }
}

// ── Earnings ───────────────────────────────────────────────────────────────────

export const getEarnings = async (userId, query) => {
  const rider = await resolveRider(userId)
  const { range = 'today', startDate, endDate } = query
  const { start, end } = getDateRange(range, startDate, endDate)

  const orders = await riderRepo.findOrdersInRange(rider.id, start, end)
  const settings = await riderRepo.findOrCreateRiderSettings(rider.id)

  // Today's bonus (simplified: stored flat bonus from settings)
  const bonusEarnings = range === 'today' ? Number(settings.bonusEarnings || 0) : 0

  const totalDeliveryFees = orders.reduce((sum, o) => sum + Number(o.deliveryFee), 0)
  const totalEarnings = totalDeliveryFees + bonusEarnings
  const averageEarnings = orders.length > 0 ? totalEarnings / orders.length : 0

  // Break down by day for custom/week/month ranges
  const byDay = {}
  orders.forEach((o) => {
    const day = new Date(o.deliveredAt).toISOString().split('T')[0]
    if (!byDay[day]) byDay[day] = { date: day, deliveries: 0, earnings: 0 }
    byDay[day].deliveries += 1
    byDay[day].earnings = parseFloat((byDay[day].earnings + Number(o.deliveryFee)).toFixed(2))
  })

  return {
    period: {
      range,
      from: start.toISOString(),
      to: end.toISOString(),
    },
    summary: {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      deliveryFees: parseFloat(totalDeliveryFees.toFixed(2)),
      bonusEarnings: parseFloat(bonusEarnings.toFixed(2)),
      deliveryCount: orders.length,
      averageEarningsPerDelivery: parseFloat(averageEarnings.toFixed(2)),
    },
    breakdown: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
  }
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export const getAnalytics = async (userId, query) => {
  const rider = await resolveRider(userId)
  const { range = 'month', startDate, endDate } = query
  const { start, end } = getDateRange(range, startDate, endDate)

  // All orders assigned to rider in the period (to compute acceptance/completion rate)
  const allOrders = await riderRepo.findAllOrdersInRange(rider.id, start, end)
  const deliveredOrders = allOrders.filter((o) => o.status === 'DELIVERED')
  const cancelledOrders = allOrders.filter((o) => o.status === 'CANCELLED')

  const totalAssigned = allOrders.length
  const completionRate =
    totalAssigned > 0 ? parseFloat(((deliveredOrders.length / totalAssigned) * 100).toFixed(1)) : 0
  const cancellationRate =
    totalAssigned > 0 ? parseFloat(((cancelledOrders.length / totalAssigned) * 100).toFixed(1)) : 0

  // Average delivery time (from createdAt to deliveredAt in minutes)
  const deliveredWithTime = deliveredOrders.filter((o) => o.deliveredAt && o.createdAt)
  const avgDeliveryTime =
    deliveredWithTime.length > 0
      ? parseFloat(
          (
            deliveredWithTime.reduce((sum, o) => {
              const diffMs = new Date(o.deliveredAt) - new Date(o.createdAt)
              return sum + diffMs / 60000
            }, 0) / deliveredWithTime.length
          ).toFixed(1)
        )
      : 0

  // Peak delivery hours — group by hour of deliveredAt
  const hourBuckets = new Array(24).fill(0)
  deliveredOrders.forEach((o) => {
    if (o.deliveredAt) {
      const hour = new Date(o.deliveredAt).getHours()
      hourBuckets[hour] += 1
    }
  })
  const peakHours = hourBuckets
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Top delivery areas — group by restaurant city
  const areaCounts = {}
  deliveredOrders.forEach((o) => {
    const area = o.restaurant?.city || 'Unknown'
    areaCounts[area] = (areaCounts[area] || 0) + 1
  })
  const topAreas = Object.entries(areaCounts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    period: {
      range,
      from: start.toISOString(),
      to: end.toISOString(),
    },
    performance: {
      totalAssigned,
      totalCompleted: deliveredOrders.length,
      totalCancelled: cancelledOrders.length,
      completionRate,
      cancellationRate,
      averageDeliveryTimeMinutes: avgDeliveryTime,
      averageRating: Number(rider.averageRating),
    },
    peakHours,
    topDeliveryAreas: topAreas,
  }
}

// ── Notifications ──────────────────────────────────────────────────────────────

export const getNotifications = async (userId, query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { notifications, total } = await riderRepo.findNotifications(userId, skip, take)
  const unreadCount = await riderRepo.countUnreadNotifications(userId)

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      data: n.data,
      createdAt: n.createdAt,
    })),
    unreadCount,
    pagination: buildMeta(total, page, limit),
  }
}

export const markNotificationRead = async (userId, notificationId) => {
  // Ensure notification exists and belongs to this user
  const { default: prisma } = await import('../config/db.js')
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
  if (!notification || notification.userId !== userId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOTIFICATION_NOT_FOUND)
  }
  return riderRepo.markNotificationRead(notificationId, userId)
}

export const markAllNotificationsRead = async (userId) => {
  const result = await riderRepo.markAllNotificationsRead(userId)
  return { updatedCount: result.count }
}

// ── Order formatting helpers ───────────────────────────────────────────────────

const formatOrderSummary = (o) => ({
  id: o.id,
  orderNumber: o.orderNumber,
  status: o.status,
  restaurant: {
    id: o.restaurant?.id,
    name: o.restaurant?.name,
    phone: o.restaurant?.phone,
    address: o.restaurant
      ? `${o.restaurant.street}, ${o.restaurant.city}`
      : null,
    latitude: o.restaurant?.latitude ? Number(o.restaurant.latitude) : null,
    longitude: o.restaurant?.longitude ? Number(o.restaurant.longitude) : null,
  },
  customer: {
    id: o.user?.id,
    name: o.user?.name,
    phone: o.user?.phone,
  },
  deliveryAddress: o.deliveryAddress,
  deliveryFee: Number(o.deliveryFee),
  totalAmount: Number(o.totalAmount),
  itemsCount: o.items?.length ?? 0,
  notes: o.notes,
  estimatedDeliveryTime: o.estimatedDeliveryTime,
  createdAt: o.createdAt,
})

const formatOrderDetail = (o) => ({
  id: o.id,
  orderNumber: o.orderNumber,
  status: o.status,
  restaurant: {
    id: o.restaurant?.id,
    name: o.restaurant?.name,
    phone: o.restaurant?.phone,
    street: o.restaurant?.street,
    landmark: o.restaurant?.landmark,
    city: o.restaurant?.city,
    state: o.restaurant?.state,
    postalCode: o.restaurant?.postalCode,
    latitude: o.restaurant?.latitude ? Number(o.restaurant.latitude) : null,
    longitude: o.restaurant?.longitude ? Number(o.restaurant.longitude) : null,
  },
  customer: {
    id: o.user?.id,
    name: o.user?.name,
    phone: o.user?.phone,
  },
  deliveryAddress: o.deliveryAddress,
  deliveryLatitude: o.deliveryLatitude ? Number(o.deliveryLatitude) : null,
  deliveryLongitude: o.deliveryLongitude ? Number(o.deliveryLongitude) : null,
  items: (o.items || []).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
  })),
  subtotal: Number(o.subtotal),
  deliveryFee: Number(o.deliveryFee),
  discount: Number(o.discount),
  tax: Number(o.tax),
  totalAmount: Number(o.totalAmount),
  notes: o.notes,
  estimatedDeliveryTime: o.estimatedDeliveryTime,
  deliveredAt: o.deliveredAt,
  createdAt: o.createdAt,
})
