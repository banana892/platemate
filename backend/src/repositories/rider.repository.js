/**
 * rider.repository.js — Data Access Layer for Delivery Partner (Phase 7)
 *
 * All Prisma interactions for the rider module are here.
 * Services call these functions. Nothing else touches Prisma directly.
 *
 * Conventions:
 *   - find*   = SELECT queries
 *   - update* = UPDATE queries
 *   - create* = INSERT queries
 *   - Pagination always returns { items, total }
 */

import prisma from '../config/db.js'

// ── Rider Profile ─────────────────────────────────────────────────────────────

/**
 * Fetch the full DeliveryPartner record (including User) by userId.
 * Returns null if the user has no DeliveryPartner profile.
 */
export const findDeliveryPartnerByUserId = async (userId) => {
  return prisma.deliveryPartner.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      settings: true,
    },
  })
}

/**
 * Lazy-initialize rider settings — returns existing or creates default.
 * Mirrors findSettingsByRestaurantId pattern in partner.repository.js
 */
export const findOrCreateRiderSettings = async (deliveryPartnerId) => {
  return prisma.deliveryPartnerSettings.upsert({
    where: { deliveryPartnerId },
    update: {},
    create: { deliveryPartnerId },
  })
}

/**
 * Update rider profile fields.
 * Runs a transaction to update both User (phone) and DeliveryPartner (vehicle info).
 * Returns the updated DeliveryPartner with user included.
 */
export const updateRiderProfile = async (deliveryPartnerId, userId, data) => {
  const { phone, vehicleType, vehicleNumber, licenseNumber } = data

  return prisma.$transaction(async (tx) => {
    // Update User phone if provided
    if (phone !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: { phone },
      })
    }

    // Update DeliveryPartner vehicle fields
    const partnerUpdateData = {}
    if (vehicleType !== undefined) partnerUpdateData.vehicleType = vehicleType
    if (vehicleNumber !== undefined) partnerUpdateData.vehicleNumber = vehicleNumber
    if (licenseNumber !== undefined) partnerUpdateData.licenseNumber = licenseNumber

    if (Object.keys(partnerUpdateData).length > 0) {
      await tx.deliveryPartner.update({
        where: { id: deliveryPartnerId },
        data: partnerUpdateData,
      })
    }

    return tx.deliveryPartner.findUnique({
      where: { id: deliveryPartnerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        settings: true,
      },
    })
  })
}

/**
 * Update rider settings (riderStatus, emergencyContact, etc.)
 */
export const updateRiderSettings = async (deliveryPartnerId, data) => {
  await findOrCreateRiderSettings(deliveryPartnerId)
  return prisma.deliveryPartnerSettings.update({
    where: { deliveryPartnerId },
    data,
  })
}

// ── Active Orders ──────────────────────────────────────────────────────────────

/**
 * Paginated list of orders currently assigned to the rider.
 * Active = READY_FOR_PICKUP or OUT_FOR_DELIVERY
 */
export const findActiveOrders = async (
  deliveryPartnerId,
  { status, skip = 0, take = 10, sortBy = 'createdAt', order = 'desc' } = {}
) => {
  const activeStatuses = ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY']

  const where = {
    deliveryPartnerId,
    status: status ? status : { in: activeStatuses },
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            street: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total }
}

/**
 * Find a single order by ID, with full details, belonging to this rider.
 * Returns null if the order doesn't belong to the rider.
 */
export const findOrderByIdForRider = async (orderId, deliveryPartnerId) => {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      deliveryPartnerId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          phone: true,
          street: true,
          landmark: true,
          city: true,
          state: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      items: {
        select: {
          id: true,
          name: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
        },
      },
    },
  })
}

/**
 * Update order delivery status with appropriate timestamp fields.
 * Also updates DeliveryPartner.totalDeliveries on DELIVERED.
 */
export const updateOrderStatus = async (orderId, deliveryPartnerId, status) => {
  const updateData = { status }

  if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date()
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: updateData,
    })

    // Increment total deliveries count on completion
    if (status === 'DELIVERED') {
      await tx.deliveryPartner.update({
        where: { id: deliveryPartnerId },
        data: { totalDeliveries: { increment: 1 } },
      })
    }

    return updated
  })
}

// ── Delivery History ───────────────────────────────────────────────────────────

/**
 * Paginated delivery history for a rider.
 * History = DELIVERED orders only (immutable, read-only).
 * Supports date filters and order number search.
 */
export const findDeliveryHistory = async (
  deliveryPartnerId,
  { startDate, endDate, search, skip = 0, take = 10, sortBy = 'createdAt', order = 'desc' } = {}
) => {
  const where = {
    deliveryPartnerId,
    status: 'DELIVERED',
  }

  if (startDate || endDate) {
    where.deliveredAt = {}
    if (startDate) where.deliveredAt.gte = new Date(startDate)
    if (endDate) where.deliveredAt.lte = new Date(endDate)
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { restaurant: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total }
}

// ── Earnings ────────────────────────────────────────────────────────────────────

/**
 * Fetch all DELIVERED orders for a rider within a date range.
 * Used for earnings and analytics calculation in the service layer.
 */
export const findOrdersInRange = async (deliveryPartnerId, startDate, endDate) => {
  return prisma.order.findMany({
    where: {
      deliveryPartnerId,
      status: 'DELIVERED',
      deliveredAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      deliveryFee: true,
      createdAt: true,
      deliveredAt: true,
      deliveryAddress: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  })
}

/**
 * Get the rider's settings including bonus earnings.
 */
export const findRiderSettingsWithBonus = async (deliveryPartnerId) => {
  return prisma.deliveryPartnerSettings.findUnique({
    where: { deliveryPartnerId },
  })
}

// ── Notifications ───────────────────────────────────────────────────────────────

/**
 * Paginated notifications for a rider user.
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
 * Count unread notifications for a rider.
 */
export const countUnreadNotifications = async (userId) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

/**
 * Mark a single notification as read (ownership-safe via userId).
 */
export const markNotificationRead = async (notificationId, userId) => {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  })
}

/**
 * Mark all unread notifications for a user as read.
 */
export const markAllNotificationsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

// ── Analytics Helpers ────────────────────────────────────────────────────────────

/**
 * Fetch ALL orders (any status) for a rider in a date range.
 * Used to compute acceptance/completion rates in analytics.
 */
export const findAllOrdersInRange = async (deliveryPartnerId, startDate, endDate) => {
  return prisma.order.findMany({
    where: {
      deliveryPartnerId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      deliveredAt: true,
      deliveryAddress: true,
      restaurant: {
        select: {
          id: true,
          city: true,
        },
      },
    },
  })
}
