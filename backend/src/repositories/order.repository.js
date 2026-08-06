import prisma from '../config/db.js'

/**
 * Create a new order, save snapshot items, increment coupon count, and clear user's cart
 * in a database transaction.
 */
export const createOrder = async (orderData, orderItemsData, cartId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create order and nested order items
    const order = await tx.order.create({
      data: {
        ...orderData,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    })

    // 2. If coupon applied, increment its usage counter
    if (orderData.couponId) {
      await tx.coupon.update({
        where: { id: orderData.couponId },
        data: {
          usedCount: { increment: 1 },
        },
      })
    }

    // 3. Create pending payment record (since payments are not integrated yet, set as PENDING)
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: 'COD', // Default provider
        method: 'COD',   // Default method
        amount: orderData.totalAmount,
        status: 'PENDING',
      },
    })

    return order
  })
}

/**
 * Retrieve paginated orders for a user with status filters
 */
export const findOrdersByUserId = async (userId, { status, skip = 0, take = 10, sortBy = 'createdAt', order = 'desc' } = {}) => {
  const where = { userId }
  if (status) {
    where.status = status
  }

  const [orders, total] = await Promise.all([
    txOrPrisma().order.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
            city: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
    txOrPrisma().order.count({ where }),
  ])

  return { orders, total }
}

/**
 * Retrieve detailed order by ID
 */
export const findOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          phone: true,
          street: true,
          city: true,
          image: true,
        },
      },
      items: true,
      coupon: {
        select: {
          code: true,
          description: true,
        },
      },
      payment: true,
      review: true,
    },
  })
}

// Helper to determine active Prisma context (e.g. if we want to run outside transaction)
const txOrPrisma = () => prisma
