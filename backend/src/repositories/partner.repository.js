import prisma from '../config/db.js'

/**
 * Settings find-or-create (lazy initialization)
 */
export const findSettingsByRestaurantId = async (restaurantId) => {
  return prisma.restaurantSettings.upsert({
    where: { restaurantId },
    update: {},
    create: { restaurantId },
  })
}

/**
 * Update restaurant settings
 */
export const updateSettings = async (restaurantId, data) => {
  // First ensure settings exist
  await findSettingsByRestaurantId(restaurantId)

  return prisma.restaurantSettings.update({
    where: { restaurantId },
    data,
  })
}

/**
 * Update restaurant profile details
 */
export const updateRestaurantProfile = async (restaurantId, data) => {
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data,
  })
}

/**
 * Update weekly business hours in a single transaction
 */
export const updateBusinessHours = async (restaurantId, businessHours) => {
  return prisma.$transaction(
    businessHours.map((bh) =>
      prisma.businessHour.upsert({
        where: {
          uq_business_hour_day: {
            restaurantId,
            dayOfWeek: bh.dayOfWeek,
          },
        },
        update: {
          openTime: bh.openTime,
          closeTime: bh.closeTime,
          isClosed: bh.isClosed,
        },
        create: {
          restaurantId,
          dayOfWeek: bh.dayOfWeek,
          openTime: bh.openTime,
          closeTime: bh.closeTime,
          isClosed: bh.isClosed,
        },
      })
    )
  )
}

/**
 * Retrieve menu categories sorted by sortOrder
 */
export const findCategories = async (restaurantId) => {
  return prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: 'asc' },
  })
}

/**
 * Fetch a single category along with its non-deleted menu items
 */
export const findCategoryWithMenuItems = async (categoryId) => {
  return prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      menuItems: {
        where: { deletedAt: null },
      },
    },
  })
}

/**
 * Create a menu category
 */
export const createCategory = async (restaurantId, data) => {
  return prisma.category.create({
    data: {
      ...data,
      restaurantId,
    },
  })
}

/**
 * Update category details
 */
export const updateCategory = async (categoryId, data) => {
  return prisma.category.update({
    where: { id: categoryId },
    data,
  })
}

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  return prisma.category.delete({
    where: { id: categoryId },
  })
}

/**
 * List non-deleted menu items with pagination and category filter
 */
export const findMenuItems = async (restaurantId, { categoryId, search, skip = 0, take = 10 } = {}) => {
  const where = {
    restaurantId,
    deletedAt: null,
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [menuItems, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip,
      take,
      include: {
        category: true,
      },
    }),
    prisma.menuItem.count({ where }),
  ])

  return { menuItems, total }
}

/**
 * Find menu item by ID
 */
export const findMenuItemById = async (id) => {
  return prisma.menuItem.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      category: true,
    },
  })
}

/**
 * Create menu item
 */
export const createMenuItem = async (restaurantId, data) => {
  // Generate unique slug
  const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`
  return prisma.menuItem.create({
    data: {
      ...data,
      slug,
      restaurantId,
    },
  })
}

/**
 * Update menu item
 */
export const updateMenuItem = async (id, data) => {
  return prisma.menuItem.update({
    where: { id },
    data,
  })
}

/**
 * Soft delete a menu item
 */
export const softDeleteMenuItem = async (id) => {
  return prisma.menuItem.update({
    where: { id },
    data: { deletedAt: new Date(), isAvailable: false },
  })
}

/**
 * Get restaurant orders
 */
export const findOrders = async (
  restaurantId,
  { status, search, startDate, endDate, skip = 0, take = 10, sortBy = 'createdAt', order = 'desc' } = {}
) => {
  const where = {
    restaurantId,
  }

  if (status) {
    where.status = status
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total }
}

/**
 * Fetch all orders for a restaurant in a date range (for analytics)
 */
export const findOrdersForAnalytics = async (restaurantId, startDate, endDate) => {
  return prisma.order.findMany({
    where: {
      restaurantId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Count active concurrent orders (PENDING, CONFIRMED, PREPARING)
 */
export const countActiveOrders = async (restaurantId) => {
  return prisma.order.count({
    where: {
      restaurantId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'PREPARING'],
      },
    },
  })
}

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  const updateData = { status }

  if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date()
  } else if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date()
  }

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
  })
}

/**
 * Fetch notifications for a partner
 */
export const findNotifications = async (userId, skip = 0, take = 10) => {
  const where = { userId }
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where }),
  ])

  return { notifications, total }
}

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId, userId) => {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  })
}

/**
 * Count how many customers have ordered more than once
 */
export const findRepeatCustomersCount = async (restaurantId) => {
  const customerOrders = await prisma.order.groupBy({
    by: ['userId'],
    where: {
      restaurantId,
      status: 'DELIVERED',
    },
    _count: {
      id: true,
    },
  })

  return customerOrders.filter((group) => group._count.id > 1).length
}
