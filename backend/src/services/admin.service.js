/**
 * admin.service.js — Business Logic for Admin (Phase 8)
 *
 * This layer owns all business rules.
 */

import * as adminRepo from '../repositories/admin.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

// ── Date range utility ───────────────────────────────────────────────────────

const getRangeDates = (range, startDate, endDate) => {
  const end = new Date()
  const start = new Date()

  if (range === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (range === 'week') {
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
  } else if (range === 'month') {
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
  } else if (range === 'year') {
    start.setDate(start.getDate() - 365)
    start.setHours(0, 0, 0, 0)
  } else if (range === 'custom') {
    return {
      start: new Date(startDate),
      end: new Date(endDate),
    }
  }

  return { start, end }
}

// ── 1. Dashboard ─────────────────────────────────────────────────────────────

export const getDashboard = async () => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [usersCount, orderStats, pendingApprovals, topRestaurants, topRiders, recentUsers] = await Promise.all([
    adminRepo.countUsersByRole(),
    adminRepo.getDashboardOrderStats(todayStart, todayEnd, monthStart),
    adminRepo.findPendingApprovalsCount(),
    adminRepo.findTopRestaurants(5),
    adminRepo.findTopRiders(5),
    adminRepo.findRecentRegistrations(5),
  ])

  return {
    users: {
      total: usersCount.totalUsers,
      customers: usersCount.CUSTOMER,
      restaurants: usersCount.PARTNER,
      riders: usersCount.RIDER,
      admins: usersCount.ADMIN,
    },
    orders: {
      today: orderStats.ordersToday,
      active: orderStats.activeOrders,
      completed: orderStats.completedOrders,
      cancelled: orderStats.cancelledOrders,
    },
    revenue: {
      today: orderStats.revenueToday,
      month: orderStats.revenueMonth,
    },
    pendingApprovals,
    topRestaurants,
    topRiders: topRiders.map((r) => ({
      id: r.id,
      name: r.user.name,
      email: r.user.email,
      averageRating: Number(r.averageRating),
      totalDeliveries: r.totalDeliveries,
    })),
    recentRegistrations: recentUsers,
  }
}

// ── 2. Customer Management ───────────────────────────────────────────────────

export const getCustomers = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { search, isActive, role, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await adminRepo.findCustomers({
    skip,
    take,
    search,
    isActive,
    role,
    sortBy,
    order,
  })

  return {
    customers: items,
    pagination: buildMeta(total, page, limit),
  }
}

export const getCustomerById = async (id) => {
  const user = await adminRepo.findCustomerById(id)
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.USER_NOT_FOUND)
  }
  return user
}

export const updateCustomerStatus = async (id, statusAction) => {
  const user = await adminRepo.findCustomerById(id)
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.USER_NOT_FOUND)
  }

  // Guard: Cannot suspend or deactivate another ADMIN
  if (user.role === 'ADMIN') {
    throw new ApiError(HTTP.FORBIDDEN, MSG.ADMIN_CANNOT_SUSPEND_ADMIN)
  }

  const isActive = statusAction === 'activate'
  const updated = await adminRepo.updateCustomerStatus(id, isActive)

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    isActive: updated.isActive,
    updatedAt: updated.updatedAt,
  }
}

// ── 3. Restaurant Management ─────────────────────────────────────────────────

export const getRestaurants = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { search, city, isApproved, isActive, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await adminRepo.findRestaurants({
    skip,
    take,
    search,
    city,
    isApproved,
    isActive,
    sortBy,
    order,
  })

  return {
    restaurants: items.map((r) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      deliveryFee: Number(r.deliveryFee),
      averageRating: Number(r.averageRating),
      isActive: r.isActive,
      isApproved: r.owner.isApproved,
      ownerBusinessName: r.owner.businessName,
      ownerName: r.owner.user.name,
      createdAt: r.createdAt,
    })),
    pagination: buildMeta(total, page, limit),
  }
}

export const getRestaurantById = async (id) => {
  const restaurant = await adminRepo.findRestaurantById(id)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  return {
    ...restaurant,
    minimumOrder: Number(restaurant.minimumOrder),
    deliveryRadius: Number(restaurant.deliveryRadius),
    deliveryFee: Number(restaurant.deliveryFee),
    averageRating: Number(restaurant.averageRating),
  }
}

export const approveRestaurant = async (id) => {
  const restaurant = await adminRepo.findRestaurantById(id)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  await adminRepo.updateRestaurantOwnerApproval(restaurant.ownerId, true)
  return { id, isApproved: true }
}

export const rejectRestaurant = async (id) => {
  const restaurant = await adminRepo.findRestaurantById(id)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  await adminRepo.updateRestaurantOwnerApproval(restaurant.ownerId, false)
  return { id, isApproved: false }
}

export const suspendRestaurant = async (id) => {
  const restaurant = await adminRepo.findRestaurantById(id)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  await adminRepo.updateRestaurantActive(id, false)
  return { id, isActive: false }
}

export const activateRestaurant = async (id) => {
  const restaurant = await adminRepo.findRestaurantById(id)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  await adminRepo.updateRestaurantActive(id, true)
  return { id, isActive: true }
}

// ── 4. Rider Management ──────────────────────────────────────────────────────

export const getRiders = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { search, isApproved, isAvailable, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await adminRepo.findRiders({
    skip,
    take,
    search,
    isApproved,
    isAvailable,
    sortBy,
    order,
  })

  return {
    riders: items.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.user.name,
      email: r.user.email,
      phone: r.user.phone,
      vehicleType: r.vehicleType,
      vehicleNumber: r.vehicleNumber,
      isApproved: r.isApproved,
      isAvailable: r.isAvailable,
      isActive: r.user.isActive,
      totalDeliveries: r.totalDeliveries,
      averageRating: Number(r.averageRating),
      createdAt: r.createdAt,
    })),
    pagination: buildMeta(total, page, limit),
  }
}

export const getRiderById = async (id) => {
  const rider = await adminRepo.findRiderById(id)
  if (!rider) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOT_FOUND)
  }

  return {
    ...rider,
    averageRating: Number(rider.averageRating),
  }
}

export const approveRider = async (id) => {
  const rider = await adminRepo.findRiderById(id)
  if (!rider) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOT_FOUND)
  }

  await adminRepo.updateRiderApproval(id, true)
  return { id, isApproved: true }
}

export const rejectRider = async (id) => {
  const rider = await adminRepo.findRiderById(id)
  if (!rider) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOT_FOUND)
  }

  await adminRepo.updateRiderApproval(id, false)
  return { id, isApproved: false }
}

export const suspendRider = async (id) => {
  const rider = await adminRepo.findRiderById(id)
  if (!rider) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOT_FOUND)
  }

  // Update Rider User record to inactive
  await adminRepo.updateCustomerStatus(rider.userId, false)
  return { id, isActive: false }
}

export const activateRider = async (id) => {
  const rider = await adminRepo.findRiderById(id)
  if (!rider) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RIDER_NOT_FOUND)
  }

  // Update Rider User record to active
  await adminRepo.updateCustomerStatus(rider.userId, true)
  return { id, isActive: true }
}

// ── 5. Order Management ──────────────────────────────────────────────────────

export const getOrders = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const {
    search,
    status,
    restaurantId,
    customerId,
    riderId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc',
  } = query

  const { items, total } = await adminRepo.findOrders({
    skip,
    take,
    search,
    status,
    restaurantId,
    customerId,
    riderId,
    startDate,
    endDate,
    sortBy,
    order,
  })

  return {
    orders: items.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      restaurantName: o.restaurant.name,
      customerName: o.user.name,
      riderName: o.deliveryPartner?.user?.name || null,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
    })),
    pagination: buildMeta(total, page, limit),
  }
}

export const getOrderById = async (id) => {
  const order = await adminRepo.findOrderById(id)
  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    tax: Number(order.tax),
    totalAmount: Number(order.totalAmount),
  }
}

export const cancelOrder = async (id, reason) => {
  const order = await adminRepo.findOrderById(id)
  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.ADMIN_ORDER_CANNOT_CANCEL)
  }

  const updated = await adminRepo.cancelOrder(id, reason)
  return {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    cancellationReason: updated.cancellationReason,
    cancelledAt: updated.cancelledAt,
  }
}

// ── 6. Review Moderation ─────────────────────────────────────────────────────

export const getReviews = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { search, restaurantId, rating, isHidden, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await adminRepo.findReviews({
    skip,
    take,
    search,
    restaurantId,
    rating,
    isHidden,
    sortBy,
    order,
  })

  return {
    reviews: items,
    pagination: buildMeta(total, page, limit),
  }
}

export const hideReview = async (id) => {
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.REVIEW_NOT_FOUND)
  }

  const updated = await adminRepo.updateReviewVisibility(id, true)
  return { id, isHidden: updated.isHidden }
}

export const restoreReview = async (id) => {
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.REVIEW_NOT_FOUND)
  }

  // Audit logging placeholder (timestamps serving as basic audit trace)
  const updated = await adminRepo.updateReviewVisibility(id, false)
  return { id, isHidden: updated.isHidden, restoredAt: new Date() }
}

// ── 7. Coupon Management ─────────────────────────────────────────────────────

export const getCoupons = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { search, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await adminRepo.findCoupons({
    skip,
    take,
    search,
    sortBy,
    order,
  })

  return {
    coupons: items.map((c) => ({
      ...c,
      discountPercent: c.discountPercent ? Number(c.discountPercent) : null,
      discountAmount: c.discountAmount ? Number(c.discountAmount) : null,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      minimumOrder: Number(c.minimumOrder),
    })),
    pagination: buildMeta(total, page, limit),
  }
}

export const getCouponById = async (id) => {
  const coupon = await adminRepo.findCouponById(id)
  if (!coupon) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.COUPON_NOT_FOUND)
  }

  return {
    ...coupon,
    discountPercent: coupon.discountPercent ? Number(coupon.discountPercent) : null,
    discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    minimumOrder: Number(coupon.minimumOrder),
  }
}

export const createCoupon = async (data) => {
  // Uniqueness check on code
  const existing = await prisma.coupon.findUnique({ where: { code: data.code } })
  if (existing) {
    throw new ApiError(HTTP.BAD_REQUEST, 'A coupon with this code already exists.')
  }

  const coupon = await adminRepo.createCoupon(data)
  return getCouponById(coupon.id)
}

export const updateCoupon = async (id, data) => {
  const coupon = await adminRepo.findCouponById(id)
  if (!coupon) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.COUPON_NOT_FOUND)
  }

  if (data.code) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } })
    if (existing && existing.id !== id) {
      throw new ApiError(HTTP.BAD_REQUEST, 'A coupon with this code already exists.')
    }
  }

  const updated = await adminRepo.updateCoupon(id, data)
  return getCouponById(updated.id)
}

export const deleteCoupon = async (id) => {
  const coupon = await adminRepo.findCouponById(id)
  if (!coupon) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.COUPON_NOT_FOUND)
  }

  await adminRepo.deleteCoupon(id)
  return { id, deleted: true }
}

// ── 8. Category (Cuisine) Management ────────────────────────────────────────

export const getCuisines = async () => {
  const { getCache, setCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS, CACHE_TTLS } = await import('../redis/cache.constants.js')

  const cached = await getCache(CACHE_KEYS.CUISINES)
  if (cached) return cached

  const result = await adminRepo.findCuisines()
  await setCache(CACHE_KEYS.CUISINES, result, CACHE_TTLS.CUISINES)
  return result
}

export const createCuisine = async (data) => {
  const existing = await prisma.cuisine.findUnique({ where: { name: data.name } })
  if (existing) {
    throw new ApiError(HTTP.BAD_REQUEST, 'A category with this name already exists.')
  }

  const result = await adminRepo.createCuisine(data)

  const { deleteCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS } = await import('../redis/cache.constants.js')
  await deleteCache(CACHE_KEYS.CUISINES)

  return result
}

export const updateCuisine = async (id, data) => {
  const cuisine = await adminRepo.findCuisineById(id)
  if (!cuisine) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADMIN_CUISINE_NOT_FOUND)
  }

  if (data.name) {
    const existing = await prisma.cuisine.findUnique({ where: { name: data.name } })
    if (existing && existing.id !== id) {
      throw new ApiError(HTTP.BAD_REQUEST, 'A category with this name already exists.')
    }
  }

  const result = await adminRepo.updateCuisine(id, data)

  const { deleteCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS } = await import('../redis/cache.constants.js')
  await deleteCache(CACHE_KEYS.CUISINES)

  return result
}

export const deleteCuisine = async (id) => {
  const cuisine = await adminRepo.findCuisineById(id)
  if (!cuisine) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADMIN_CUISINE_NOT_FOUND)
  }

  // Guard: Cannot delete if category is in use
  const usageCount = await adminRepo.countRestaurantsUsingCuisine(id)
  if (usageCount > 0) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.ADMIN_CUISINE_IN_USE)
  }

  await adminRepo.deleteCuisine(id)

  const { deleteCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS } = await import('../redis/cache.constants.js')
  await deleteCache(CACHE_KEYS.CUISINES)

  return { id, deleted: true }
}

// ── 9. Analytics ─────────────────────────────────────────────────────────────

export const getAnalytics = async (query) => {
  const { range = 'month', startDate, endDate } = query

  const { getCache, setCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS, CACHE_TTLS } = await import('../redis/cache.constants.js')

  const rangeKey = `admin_analytics:${range}_${startDate || ''}_${endDate || ''}`
  const cacheKey = CACHE_KEYS.ANALYTICS(rangeKey)

  const cached = await getCache(cacheKey)
  if (cached) return cached

  const { start, end } = getRangeDates(range, startDate, endDate)

  const allOrders = await adminRepo.findOrdersForAnalytics(start, end)
  const deliveredOrders = allOrders.filter((o) => o.status === 'DELIVERED')
  const totalOrders = allOrders.length

  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)

  // Top Customer calculation
  const customerCounts = {}
  deliveredOrders.forEach((o) => {
    customerCounts[o.userId] = (customerCounts[o.userId] || 0) + Number(o.totalAmount)
  })
  const topCustomersRaw = Object.entries(customerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topCustomers = await Promise.all(
    topCustomersRaw.map(async ([userId, spend]) => {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
      return { id: userId, name: user?.name || 'Unknown', email: user?.email || '', totalSpend: parseFloat(spend.toFixed(2)) }
    })
  )

  // Top Rider calculation
  const riderCounts = {}
  deliveredOrders.forEach((o) => {
    if (o.deliveryPartnerId) {
      riderCounts[o.deliveryPartnerId] = (riderCounts[o.deliveryPartnerId] || 0) + 1
    }
  })
  const topRidersRaw = Object.entries(riderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topRiders = await Promise.all(
    topRidersRaw.map(async ([riderId, count]) => {
      const dp = await prisma.deliveryPartner.findUnique({
        where: { id: riderId },
        include: { user: { select: { name: true } } },
      })
      return { id: riderId, name: dp?.user?.name || 'Unknown', deliveriesCompleted: count }
    })
  )

  // Top Restaurants
  const restaurantCounts = {}
  deliveredOrders.forEach((o) => {
    restaurantCounts[o.restaurantId] = (restaurantCounts[o.restaurantId] || 0) + Number(o.totalAmount)
  })
  const topRestaurantsRaw = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topRestaurants = await Promise.all(
    topRestaurantsRaw.map(async ([restId, revenue]) => {
      const rest = await prisma.restaurant.findUnique({ where: { id: restId }, select: { name: true } })
      return { id: restId, name: rest?.name || 'Unknown', totalSales: parseFloat(revenue.toFixed(2)) }
    })
  )

  // Average Delivery Time computation
  const ordersWithTime = deliveredOrders.filter((o) => o.deliveredAt && o.createdAt)
  const avgDeliveryTimeMinutes =
    ordersWithTime.length > 0
      ? parseFloat(
          (
            ordersWithTime.reduce((sum, o) => sum + (new Date(o.deliveredAt) - new Date(o.createdAt)) / 60000, 0) /
            ordersWithTime.length
          ).toFixed(1)
        )
      : 0

  const [topCities, popularCategories] = await Promise.all([
    adminRepo.findTopCities(),
    adminRepo.findPopularCategories(),
  ])

  const result = {
    period: {
      range,
      from: start.toISOString(),
      to: end.toISOString(),
    },
    performance: {
      totalOrders,
      completedOrders: deliveredOrders.length,
      cancelledOrders: allOrders.filter((o) => o.status === 'CANCELLED').length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageDeliveryTimeMinutes: avgDeliveryTimeMinutes,
    },
    topCities,
    topRestaurants,
    topCustomers,
    topRiders,
    popularCategories,
  }

  await setCache(cacheKey, result, CACHE_TTLS.ANALYTICS)
  return result
}

// ── 10. Notifications ────────────────────────────────────────────────────────

export const getNotifications = async (userId, query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { notifications, total } = await adminRepo.findNotificationsByUserId(userId, skip, take)

  return {
    notifications,
    pagination: buildMeta(total, page, limit),
  }
}

export const broadcastNotification = async (data) => {
  const { type, title, message, target } = data
  const count = await adminRepo.broadcastNotification(type, title, message, target)

  // Real-time Events
  const { presence } = await import('../socket/socket.handlers.js')
  const { emitToUser, emitToRoom } = await import('../socket/socket.events.js')
  const { EVENTS, ROOMS } = await import('../socket/socket.constants.js')

  // Map target to user DB query role
  const targetRoleMap = {
    CUSTOMER: 'CUSTOMER',
    PARTNER: 'PARTNER',
    RIDER: 'RIDER',
  }

  // Get all user IDs from database that match the target role
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      ...(target !== 'ALL' ? { role: targetRoleMap[target] } : {}),
    },
    select: { id: true, role: true },
  })

  // Loop and emit notification:new to online users
  const { getOnlinePresence } = await import('../redis/redis.service.js')
  const onlineUserIds = await getOnlinePresence('users')
  const onlineUserSet = new Set(onlineUserIds)

  for (const u of users) {
    if (onlineUserSet.has(u.id)) {
      emitToUser(u.id, EVENTS.NOTIFICATION_NEW, {
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Emit to specific role rooms/topics
  if (target === 'ALL' || target === 'PARTNER') {
    // Find all restaurant IDs to broadcast restaurant:notification
    const restaurants = await prisma.restaurant.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
    })
    for (const r of restaurants) {
      emitToRoom(ROOMS.RESTAURANT(r.id), EVENTS.RESTAURANT_NOTIFICATION, {
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (target === 'ALL' || target === 'RIDER') {
    // Broadcast rider:notification to all online riders
    const onlineRiderIds = await getOnlinePresence('riders')
    for (const dpId of onlineRiderIds) {
      emitToRoom(ROOMS.RIDER(dpId), EVENTS.RIDER_NOTIFICATION, {
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (target === 'ALL') {
    emitToRoom(ROOMS.ADMIN, EVENTS.ADMIN_NOTIFICATION, {
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
    })
  }

  return { broadcastCount: count }
}

// ── 11. Platform Settings ────────────────────────────────────────────────────

export const getSettings = async () => {
  const { getCache, setCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS, CACHE_TTLS } = await import('../redis/cache.constants.js')

  const cached = await getCache(CACHE_KEYS.SETTINGS)
  if (cached) return cached

  const settings = await adminRepo.findOrCreatePlatformSettings()
  const result = {
    id: settings.id,
    platformName: settings.platformName,
    platformFeePercent: Number(settings.platformFeePercent),
    defaultDeliveryFee: Number(settings.defaultDeliveryFee),
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    maintenanceMode: settings.maintenanceMode,
    termsUrl: settings.termsUrl,
    privacyUrl: settings.privacyUrl,
    updatedAt: settings.updatedAt,
  }

  await setCache(CACHE_KEYS.SETTINGS, result, CACHE_TTLS.SETTINGS)
  return result
}

export const updateSettings = async (data) => {
  const settings = await adminRepo.findOrCreatePlatformSettings()
  const updated = await adminRepo.updatePlatformSettings(settings.id, data)
  const result = {
    id: updated.id,
    platformName: updated.platformName,
    platformFeePercent: Number(updated.platformFeePercent),
    defaultDeliveryFee: Number(updated.defaultDeliveryFee),
    supportEmail: updated.supportEmail,
    supportPhone: updated.supportPhone,
    maintenanceMode: updated.maintenanceMode,
    termsUrl: updated.termsUrl,
    privacyUrl: updated.privacyUrl,
    updatedAt: updated.updatedAt,
  }

  const { deleteCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS } = await import('../redis/cache.constants.js')
  await deleteCache(CACHE_KEYS.SETTINGS)

  return result
}

// ── Audit Logs (Phase 13) ────────────────────────────────────────────────────

import prisma from '../config/db.js'

/**
 * Query the AuditLog table with pagination and optional filters.
 *
 * @param {object} filters
 * @param {string} [filters.userId]
 * @param {string} [filters.action]   - AuditAction enum value
 * @param {string} [filters.severity] - AuditSeverity enum value
 * @param {string} [filters.from]     - ISO date string
 * @param {string} [filters.to]       - ISO date string
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export const getAuditLogs = async ({ userId, action, severity, from, to, page, limit } = {}) => {
  const { skip, take } = parsePagination({ page, limit })

  const where = {}
  if (userId) where.userId = userId
  if (action) where.action = action
  if (severity) where.severity = severity
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        requestId: true,
        userId: true,
        action: true,
        severity: true,
        ip: true,
        userAgent: true,
        meta: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    meta: buildMeta({ page: page || 1, limit: take, total }),
  }
}
