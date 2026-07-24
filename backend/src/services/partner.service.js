import * as partnerRepo from '../repositories/partner.repository.js'
import * as restaurantRepo from '../repositories/restaurant.repository.js'
import prisma from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

const invalidateRestaurantCache = async (restaurantId, slug = null) => {
  try {
    const { deleteCache } = await import('../redis/redis.service.js')
    const { CACHE_KEYS } = await import('../redis/cache.constants.js')
    await deleteCache(CACHE_KEYS.RESTAURANT(restaurantId))
    await deleteCache(CACHE_KEYS.MENU(restaurantId))
    if (slug) {
      await deleteCache(CACHE_KEYS.RESTAURANT(slug))
    }
  } catch (err) {}
}

/**
 * Helper to parse date ranges for analytics
 */
const getDateRange = (range, startDate, endDate) => {
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
  } else if (range === 'custom') {
    return {
      start: new Date(startDate),
      end: new Date(endDate),
    }
  }

  return { start, end }
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboard = async (restaurantId) => {
  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(restaurantId)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

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

  // 1. Fetch completed orders for the last 30 days
  const orders = await partnerRepo.findOrdersForAnalytics(restaurantId, monthStart, now)

  // 2. Fetch recent orders
  const { orders: recentOrders } = await partnerRepo.findOrders(restaurantId, { take: 5 })

  // 3. Compute stats
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED')
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING')
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED')

  const todayOrders = orders.filter((o) => o.createdAt >= todayStart && o.createdAt <= todayEnd)
  const todayCompleted = todayOrders.filter((o) => o.status === 'DELIVERED')
  const todayRevenue = todayCompleted.reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const weekCompleted = completedOrders.filter((o) => o.createdAt >= weekStart)
  const weekRevenue = weekCompleted.reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const monthRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)

  // Popular items
  const itemCounts = {}
  completedOrders.forEach((o) => {
    o.items.forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity
    })
  })
  const popularItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Top Categories
  const categoryCounts = {}
  completedOrders.forEach((o) => {
    o.items.forEach((i) => {
      const catName = i.menuItem?.category?.name || 'Other'
      categoryCounts[catName] = (categoryCounts[catName] || 0) + i.quantity
    })
  })
  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    todayStats: {
      ordersCount: todayOrders.length,
      revenue: parseFloat(todayRevenue.toFixed(2)),
    },
    ordersSummary: {
      pending: pendingOrders.length,
      preparing: preparingOrders.length,
      completed: completedOrders.length,
      cancelled: cancelledOrders.length,
    },
    revenueSummary: {
      weekly: parseFloat(weekRevenue.toFixed(2)),
      monthly: parseFloat(monthRevenue.toFixed(2)),
    },
    restaurantRating: {
      averageRating: Number(restaurant.averageRating),
      totalReviews: restaurant.totalReviews,
    },
    popularItems,
    topCategories,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
    })),
  }
}

// ── Profile & Settings ────────────────────────────────────────────────────────

export const getProfile = async (restaurantId) => {
  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(restaurantId)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }
  return {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.image,
    phone: restaurant.phone,
    email: restaurant.email,
    street: restaurant.street,
    landmark: restaurant.landmark,
    city: restaurant.city,
    state: restaurant.state,
    country: restaurant.country,
    postalCode: restaurant.postalCode,
    latitude: Number(restaurant.latitude),
    longitude: Number(restaurant.longitude),
    deliveryRadius: Number(restaurant.deliveryRadius),
    deliveryFee: Number(restaurant.deliveryFee),
    minimumOrder: Number(restaurant.minimumOrder),
    averageDeliveryTime: restaurant.averageDeliveryTime,
  }
}

export const updateProfile = async (restaurantId, data) => {
  const updated = await partnerRepo.updateRestaurantProfile(restaurantId, data)
  await invalidateRestaurantCache(restaurantId, updated.slug)
  return getProfile(updated.id)
}

export const getSettings = async (restaurantId) => {
  const settings = await partnerRepo.findSettingsByRestaurantId(restaurantId)
  return {
    autoAcceptOrders: settings.autoAcceptOrders,
    acceptCashOnDelivery: settings.acceptCashOnDelivery,
    acceptScheduledOrders: settings.acceptScheduledOrders,
    preparationBufferTime: settings.preparationBufferTime,
    estimatedPreparationTime: settings.estimatedPreparationTime,
    maxConcurrentOrders: settings.maxConcurrentOrders,
    defaultPackagingCharge: Number(settings.defaultPackagingCharge),
    restaurantAnnouncement: settings.restaurantAnnouncement,
    isTemporarilyClosed: settings.isTemporarilyClosed,
    temporaryClosureReason: settings.temporaryClosureReason,
    autoPauseWhenBusy: settings.autoPauseWhenBusy,
  }
}

export const updateSettings = async (restaurantId, data) => {
  const updated = await partnerRepo.updateSettings(restaurantId, data)
  await invalidateRestaurantCache(restaurantId)
  return {
    autoAcceptOrders: updated.autoAcceptOrders,
    acceptCashOnDelivery: updated.acceptCashOnDelivery,
    acceptScheduledOrders: updated.acceptScheduledOrders,
    preparationBufferTime: updated.preparationBufferTime,
    estimatedPreparationTime: updated.estimatedPreparationTime,
    maxConcurrentOrders: updated.maxConcurrentOrders,
    defaultPackagingCharge: Number(updated.defaultPackagingCharge),
    restaurantAnnouncement: updated.restaurantAnnouncement,
    isTemporarilyClosed: updated.isTemporarilyClosed,
    temporaryClosureReason: updated.temporaryClosureReason,
    autoPauseWhenBusy: updated.autoPauseWhenBusy,
  }
}

// ── Business Hours ────────────────────────────────────────────────────────────

export const getBusinessHours = async (restaurantId) => {
  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(restaurantId)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }
  return restaurant.businessHours.map((bh) => ({
    id: bh.id,
    dayOfWeek: bh.dayOfWeek,
    openTime: bh.openTime,
    closeTime: bh.closeTime,
    isClosed: bh.isClosed,
  }))
}

export const updateBusinessHours = async (restaurantId, data) => {
  const { businessHours } = data
  await partnerRepo.updateBusinessHours(restaurantId, businessHours)
  await invalidateRestaurantCache(restaurantId)
  return getBusinessHours(restaurantId)
}

// ── Menu Categories ───────────────────────────────────────────────────────────

export const getCategories = async (restaurantId) => {
  return partnerRepo.findCategories(restaurantId)
}

export const createCategory = async (restaurantId, data) => {
  const result = await partnerRepo.createCategory(restaurantId, data)
  await invalidateRestaurantCache(restaurantId)
  return result
}

export const updateCategory = async (restaurantId, categoryId, data) => {
  const categories = await partnerRepo.findCategories(restaurantId)
  const exists = categories.some((c) => c.id === categoryId)
  if (!exists) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }
  const result = await partnerRepo.updateCategory(categoryId, data)
  await invalidateRestaurantCache(restaurantId)
  return result
}

export const deleteCategory = async (restaurantId, categoryId) => {
  const category = await partnerRepo.findCategoryWithMenuItems(categoryId)
  if (!category) {
    throw new ApiError(HTTP.NOT_FOUND, 'Category not found')
  }

  if (category.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  const activeItems = category.menuItems.filter((item) => item.deletedAt === null)
  if (activeItems.length > 0) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Cannot delete category containing menu items')
  }

  // Physically delete soft-deleted items that are not in historical orders.
  // If they are in historical orders, Postgres will restrict their deletion,
  // which will trigger the catch block.
  try {
    await prisma.menuItem.deleteMany({
      where: {
        categoryId,
        deletedAt: { not: null },
      },
    })
    await partnerRepo.deleteCategory(categoryId)
  } catch (err) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      'Cannot delete category because its menu items are referenced in historical orders'
    )
  }

  await invalidateRestaurantCache(restaurantId)
  return { id: categoryId }
}

// ── Menu Items ────────────────────────────────────────────────────────────────

export const getMenuItems = async (restaurantId, query) => {
  const { page = 1, limit = 10, categoryId, search } = query
  const skip = (page - 1) * limit

  const { menuItems, total } = await partnerRepo.findMenuItems(restaurantId, {
    categoryId,
    search,
    skip,
    take: limit,
  })

  return {
    menuItems: menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: Number(item.price),
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      sortOrder: item.sortOrder,
      category: {
        id: item.category.id,
        name: item.category.name,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export const getMenuItemById = async (restaurantId, id) => {
  const item = await partnerRepo.findMenuItemById(id)
  if (!item || item.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.MENU_ITEM_NOT_FOUND)
  }
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    price: Number(item.price),
    isVeg: item.isVeg,
    isAvailable: item.isAvailable,
    sortOrder: item.sortOrder,
    category: {
      id: item.category.id,
      name: item.category.name,
    },
  }
}

export const createMenuItem = async (restaurantId, data) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  })
  if (!category || category.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Invalid Category ID')
  }

  const result = await partnerRepo.createMenuItem(restaurantId, data)
  await invalidateRestaurantCache(restaurantId)
  return result
}

export const updateMenuItem = async (restaurantId, id, data) => {
  const item = await partnerRepo.findMenuItemById(id)
  if (!item || item.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.MENU_ITEM_NOT_FOUND)
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })
    if (!category || category.restaurantId !== restaurantId) {
      throw new ApiError(HTTP.BAD_REQUEST, 'Invalid Category ID')
    }
  }

  const result = await partnerRepo.updateMenuItem(id, data)
  await invalidateRestaurantCache(restaurantId)
  return result
}

export const deleteMenuItem = async (restaurantId, id) => {
  const item = await partnerRepo.findMenuItemById(id)
  if (!item || item.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.MENU_ITEM_NOT_FOUND)
  }
  await partnerRepo.softDeleteMenuItem(id)
  await invalidateRestaurantCache(restaurantId)
  return { id }
}

export const updateMenuItemAvailability = async (restaurantId, id, isAvailable) => {
  const item = await partnerRepo.findMenuItemById(id)
  if (!item || item.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.MENU_ITEM_NOT_FOUND)
  }
  const result = await partnerRepo.updateMenuItem(id, { isAvailable })
  await invalidateRestaurantCache(restaurantId)
  return result
}

// ── Restaurant Availability Toggles ──────────────────────────────────────────

export const toggleRestaurantAvailability = async (restaurantId, openFlag, reason = null) => {
  const settings = await partnerRepo.findSettingsByRestaurantId(restaurantId)

  // Update settings temporary closure state
  await partnerRepo.updateSettings(restaurantId, {
    isTemporarilyClosed: !openFlag,
    temporaryClosureReason: openFlag ? null : reason,
  })

  // Update Restaurant model active state
  await partnerRepo.updateRestaurantProfile(restaurantId, {
    isActive: true, // Remains in database but overridden by settings closure
  })

  return { restaurantId, isTemporarilyClosed: !openFlag, temporaryClosureReason: openFlag ? null : reason }
}

// ── Order Management ─────────────────────────────────────────────────────────

export const getOrders = async (restaurantId, query) => {
  const { page = 1, limit = 10, status, search, startDate, endDate, sortBy = 'createdAt', order = 'desc' } = query
  const skip = (page - 1) * limit

  const { orders, total } = await partnerRepo.findOrders(restaurantId, {
    status,
    search,
    startDate,
    endDate,
    skip,
    take: limit,
    sortBy,
    order,
  })

  return {
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name,
      customerPhone: o.user.phone,
      status: o.status,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      tax: Number(o.tax),
      discount: Number(o.discount),
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
      itemsCount: o.items.length,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export const getOrderById = async (restaurantId, id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      items: true,
    },
  })

  if (!order || order.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.user,
    status: order.status,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    tax: Number(order.tax),
    totalAmount: Number(order.totalAmount),
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  }
}

export const updateOrderStatus = async (restaurantId, orderId, status) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order || order.restaurantId !== restaurantId) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  // 1. Enforce State Machine Transitions
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING'],
    PREPARING: ['READY_FOR_PICKUP'],
    READY_FOR_PICKUP: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  }

  if (!validTransitions[order.status].includes(status)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `Invalid status transition from ${order.status} to ${status}`
    )
  }

  // 2. Max Concurrent Orders & Auto Pause Check
  if (status === 'CONFIRMED' || status === 'PREPARING') {
    const settings = await partnerRepo.findSettingsByRestaurantId(restaurantId)
    const activeOrdersCount = await partnerRepo.countActiveOrders(restaurantId)

    if (activeOrdersCount >= settings.maxConcurrentOrders) {
      if (settings.autoPauseWhenBusy) {
        await partnerRepo.updateSettings(restaurantId, {
          isTemporarilyClosed: true,
          temporaryClosureReason: 'Busy with active orders (Auto Paused)',
        })
      }
      
      // We still allow confirming the order if autoPause is triggered,
      // or we can block it if the count STRICTLY exceeds max and autoPause is off.
      // Standard behavior: Accept the order but pause incoming orders.
    }
  }

  const updated = await partnerRepo.updateOrderStatus(orderId, status)

  // Real-time Events
  const { emitToUser, emitToRestaurant, emitToRider } = await import('../socket/socket.events.js')
  const { EVENTS } = await import('../socket/socket.constants.js')

  emitToUser(order.userId, EVENTS.ORDER_UPDATED, {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    updatedAt: updated.updatedAt,
  })

  emitToRestaurant(restaurantId, EVENTS.RESTAURANT_ORDER_UPDATED, {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    updatedAt: updated.updatedAt,
  })

  if (status === 'READY_FOR_PICKUP' && order.deliveryPartnerId) {
    emitToRider(order.deliveryPartnerId, EVENTS.RIDER_NEW_ASSIGNMENT, {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      restaurantId: restaurantId,
      updatedAt: updated.updatedAt,
    })
  }

  return {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    updatedAt: updated.updatedAt,
  }
}

// ── Restaurant Analytics ──────────────────────────────────────────────────────

export const getAnalytics = async (restaurantId, query) => {
  const { range = 'today', startDate, endDate } = query
  const { start, end } = getDateRange(range, startDate, endDate)

  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(restaurantId)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  const orders = await partnerRepo.findOrdersForAnalytics(restaurantId, start, end)
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED')

  // Calculate values
  const revenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const ordersCount = completedOrders.length
  const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0

  // Unique customers
  const customerIds = new Set(completedOrders.map((o) => o.userId))
  const customerCount = customerIds.size

  // Popular items
  const itemCounts = {}
  completedOrders.forEach((o) => {
    o.items.forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity
    })
  })
  const popularItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Top Categories
  const categoryCounts = {}
  completedOrders.forEach((o) => {
    o.items.forEach((i) => {
      const catName = i.menuItem?.category?.name || 'Other'
      categoryCounts[catName] = (categoryCounts[catName] || 0) + i.quantity
    })
  })
  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Repeat Customer percentage
  const repeatStats = await partnerRepo.findRepeatCustomersCount(restaurantId)

  return {
    summary: {
      revenue: parseFloat(revenue.toFixed(2)),
      ordersCount,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      customerCount,
      averageRating: Number(restaurant.averageRating),
      repeatCustomerCount: repeatStats,
    },
    popularItems,
    topCategories,
  }
}

// ── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 10 } = query
  const skip = (page - 1) * limit
  const { notifications, total } = await partnerRepo.findNotifications(userId, skip, limit)
  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export const markNotificationRead = async (userId, id) => {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) {
    throw new ApiError(HTTP.NOT_FOUND, 'Notification not found')
  }
  return partnerRepo.markNotificationRead(id, userId)
}
