/**
 * admin.repository.js — Data Access Layer for Admin (Phase 8)
 *
 * All Prisma interactions for the admin module are isolated here.
 */

import prisma from '../config/db.js'

// ── 1. Dashboard Data Access ─────────────────────────────────────────────────

export const countUsersByRole = async () => {
  const counts = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
    where: { deletedAt: null },
  })

  // Map into role dictionary
  const roles = { CUSTOMER: 0, PARTNER: 0, RIDER: 0, ADMIN: 0 }
  counts.forEach((item) => {
    roles[item.role] = item._count.id
  })

  const totalUsers = await prisma.user.count({ where: { deletedAt: null } })
  return { ...roles, totalUsers }
}

export const getDashboardOrderStats = async (todayStart, todayEnd, monthStart) => {
  const [ordersToday, revenueToday, revenueMonth, activeOrders, cancelledOrders, completedOrders] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.order.aggregate({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: monthStart },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
      },
    }),
    prisma.order.count({
      where: { status: 'CANCELLED' },
    }),
    prisma.order.count({
      where: { status: 'DELIVERED' },
    }),
  ])

  return {
    ordersToday,
    revenueToday: Number(revenueToday._sum.totalAmount || 0),
    revenueMonth: Number(revenueMonth._sum.totalAmount || 0),
    activeOrders,
    cancelledOrders,
    completedOrders,
  }
}

export const findPendingApprovalsCount = async () => {
  const [restaurants, riders] = await Promise.all([
    prisma.restaurantOwner.count({ where: { isApproved: false } }),
    prisma.deliveryPartner.count({ where: { isApproved: false } }),
  ])
  return { restaurants, riders }
}

export const findTopRestaurants = async (limit = 5) => {
  return prisma.restaurant.findMany({
    where: { deletedAt: null },
    orderBy: { averageRating: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      averageRating: true,
      totalReviews: true,
      city: true,
    },
  })
}

export const findTopRiders = async (limit = 5) => {
  return prisma.deliveryPartner.findMany({
    orderBy: { averageRating: 'desc' },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}

export const findRecentRegistrations = async (limit = 5) => {
  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })
}

// ── 2. Customer Management ───────────────────────────────────────────────────

export const findCustomers = async ({ skip, take, search, isActive, role, sortBy, order }) => {
  const where = {
    deletedAt: null,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (isActive !== undefined) {
    where.isActive = isActive
  }

  if (role) {
    where.role = role
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  return { items, total }
}

export const findCustomerById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      _count: {
        select: { orders: true, reviews: true },
      },
    },
  })
}

export const updateCustomerStatus = async (id, isActive) => {
  return prisma.user.update({
    where: { id },
    data: { isActive },
  })
}

// ── 3. Restaurant Management ─────────────────────────────────────────────────

export const findRestaurants = async ({ skip, take, search, city, isApproved, isActive, sortBy, order }) => {
  const where = {
    deletedAt: null,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (city) {
    where.city = { contains: city, mode: 'insensitive' }
  }

  if (isActive !== undefined) {
    where.isActive = isActive
  }

  if (isApproved !== undefined) {
    where.owner = {
      isApproved: isApproved,
    }
  }

  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        owner: {
          select: {
            id: true,
            businessName: true,
            isApproved: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.restaurant.count({ where }),
  ])

  return { items, total }
}

export const findRestaurantById = async (id) => {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      owner: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      settings: true,
      businessHours: true,
      cuisines: {
        include: { cuisine: true },
      },
    },
  })
}

export const updateRestaurantOwnerApproval = async (ownerId, isApproved) => {
  return prisma.restaurantOwner.update({
    where: { id: ownerId },
    data: { isApproved },
  })
}

export const updateRestaurantActive = async (restaurantId, isActive) => {
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: { isActive },
  })
}

// ── 4. Rider Management ──────────────────────────────────────────────────────

export const findRiders = async ({ skip, take, search, isApproved, isAvailable, sortBy, order }) => {
  const where = {}

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }
  }

  if (isApproved !== undefined) {
    where.isApproved = isApproved
  }

  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable
  }

  const [items, total] = await Promise.all([
    prisma.deliveryPartner.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.deliveryPartner.count({ where }),
  ])

  return { items, total }
}

export const findRiderById = async (id) => {
  return prisma.deliveryPartner.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      },
      settings: true,
    },
  })
}

export const updateRiderApproval = async (riderId, isApproved) => {
  return prisma.deliveryPartner.update({
    where: { id: riderId },
    data: { isApproved },
  })
}

// ── 5. Order Management ──────────────────────────────────────────────────────

export const findOrders = async ({
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
}) => {
  const where = {}

  if (search) {
    where.orderNumber = { contains: search, mode: 'insensitive' }
  }

  if (status) {
    where.status = status
  }

  if (restaurantId) {
    where.restaurantId = restaurantId
  }

  if (customerId) {
    where.userId = customerId
  }

  if (riderId) {
    where.deliveryPartnerId = riderId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        restaurant: { select: { id: true, name: true, city: true } },
        user: { select: { id: true, name: true, email: true } },
        deliveryPartner: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  return { items, total }
}

export const findOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      deliveryPartner: {
        include: { user: { select: { id: true, name: true, phone: true } } },
      },
      coupon: true,
      items: true,
      payment: true,
      review: true,
    },
  })
}

export const cancelOrder = async (id, reason) => {
  return prisma.order.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: new Date(),
    },
  })
}

// ── 6. Review Moderation ─────────────────────────────────────────────────────

export const findReviews = async ({ skip, take, search, restaurantId, rating, isHidden, sortBy, order }) => {
  const where = {}

  if (search) {
    where.comment = { contains: search, mode: 'insensitive' }
  }

  if (restaurantId) {
    where.restaurantId = restaurantId
  }

  if (rating !== undefined) {
    where.rating = rating
  }

  if (isHidden !== undefined) {
    where.isHidden = isHidden
  }

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        restaurant: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.review.count({ where }),
  ])

  return { items, total }
}

export const updateReviewVisibility = async (id, isHidden) => {
  return prisma.review.update({
    where: { id },
    data: { isHidden },
  })
}

// ── 7. Coupon Management ─────────────────────────────────────────────────────

export const findCoupons = async ({ skip, take, search, sortBy, order }) => {
  const where = {}

  if (search) {
    where.code = { contains: search, mode: 'insensitive' }
  }

  const [items, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
    }),
    prisma.coupon.count({ where }),
  ])

  return { items, total }
}

export const findCouponById = async (id) => {
  return prisma.coupon.findUnique({
    where: { id },
  })
}

export const createCoupon = async (data) => {
  return prisma.coupon.create({
    data,
  })
}

export const updateCoupon = async (id, data) => {
  return prisma.coupon.update({
    where: { id },
    data,
  })
}

export const deleteCoupon = async (id) => {
  return prisma.coupon.delete({
    where: { id },
  })
}

// ── 8. Category (Cuisine) Management ────────────────────────────────────────

export const findCuisines = async () => {
  return prisma.cuisine.findMany({
    orderBy: { name: 'asc' },
  })
}

export const findCuisineById = async (id) => {
  return prisma.cuisine.findUnique({
    where: { id },
  })
}

export const createCuisine = async (data) => {
  return prisma.cuisine.create({
    data,
  })
}

export const updateCuisine = async (id, data) => {
  return prisma.cuisine.update({
    where: { id },
    data,
  })
}

export const deleteCuisine = async (id) => {
  return prisma.cuisine.delete({
    where: { id },
  })
}

export const countRestaurantsUsingCuisine = async (cuisineId) => {
  return prisma.restaurantCuisine.count({
    where: { cuisineId },
  })
}

// ── 9. Analytics ─────────────────────────────────────────────────────────────

export const findOrdersForAnalytics = async (startDate, endDate) => {
  return prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      deliveredAt: true,
      restaurantId: true,
      userId: true,
      deliveryPartnerId: true,
    },
  })
}

export const findTopCities = async () => {
  const result = await prisma.restaurant.groupBy({
    by: ['city'],
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
    take: 5,
  })
  return result.map((r) => ({ city: r.city, count: r._count.id }))
}

export const findPopularCategories = async () => {
  // Aggregate using RestaurantCuisine to count cuisines
  const result = await prisma.restaurantCuisine.groupBy({
    by: ['cuisineId'],
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
    take: 5,
  })

  // Populate names
  const enriched = await Promise.all(
    result.map(async (r) => {
      const cuisine = await prisma.cuisine.findUnique({
        where: { id: r.cuisineId },
        select: { name: true },
      })
      return {
        name: cuisine?.name || 'Unknown',
        count: r._count.id,
      };
    })
  )
  return enriched
}

// ── 10. Notifications ────────────────────────────────────────────────────────

export const broadcastNotification = async (type, title, message, targetRole) => {
  // Find all active users with the target role
  const where = {
    isActive: true,
    deletedAt: null,
  }

  if (targetRole && targetRole !== 'ALL') {
    where.role = targetRole
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  })

  if (users.length === 0) return 0

  // Bulk create notifications for targeted users
  const notificationsData = users.map((u) => ({
    userId: u.id,
    type,
    title,
    message,
    isRead: false,
  }))

  const result = await prisma.notification.createMany({
    data: notificationsData,
  })

  return result.count
}

export const findNotificationsByUserId = async (userId, skip, take) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where: { userId } }),
  ])
  return { notifications, total }
}

// ── 11. Platform Settings ────────────────────────────────────────────────────

export const findOrCreatePlatformSettings = async () => {
  const settings = await prisma.platformSettings.findFirst()
  if (settings) return settings

  // Create default first row
  return prisma.platformSettings.create({
    data: {},
  })
}

export const updatePlatformSettings = async (id, data) => {
  return prisma.platformSettings.update({
    where: { id },
    data,
  })
}
