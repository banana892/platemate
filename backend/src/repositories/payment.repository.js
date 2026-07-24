/**
 * payment.repository.js — Database Access Layer for Payment System (Phase 10)
 *
 * Encapsulates database actions strictly without business rules or service constraints.
 */

import prisma from '../config/db.js'

export const findPaymentById = async (id) => {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export const findPaymentByOrderId = async (orderId) => {
  return prisma.payment.findUnique({
    where: { orderId },
  })
}

export const findPaymentByProviderOrderId = async (providerOrderId) => {
  return prisma.payment.findUnique({
    where: { providerOrderId },
  })
}

export const findPaymentByProviderPaymentId = async (providerPaymentId) => {
  return prisma.payment.findUnique({
    where: { providerPaymentId },
  })
}

export const createPayment = async (data) => {
  return prisma.payment.create({
    data,
  })
}

export const updatePayment = async (id, data) => {
  return prisma.payment.update({
    where: { id },
    data,
  })
}

/**
 * Fetch customer payment history with filters and pagination.
 */
export const findCustomerPayments = async (userId, { skip, take, status, provider, sortBy, order }) => {
  const where = {
    userId,
  }

  if (status) where.status = status
  if (provider) where.provider = provider

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        order: { select: { id: true, orderNumber: true } },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return { items, total }
}

/**
 * Fetch admin payment list with filters and pagination.
 */
export const findAdminPayments = async ({ skip, take, status, provider, sortBy, order }) => {
  const where = {}

  if (status) where.status = status
  if (provider) where.provider = provider

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        order: { select: { id: true, orderNumber: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return { items, total }
}

/**
 * Fetch payments within date range for analytics aggregation.
 */
export const findPaymentsForAnalytics = async (startDate, endDate) => {
  return prisma.payment.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      amount: true,
      status: true,
      method: true,
      provider: true,
      refundAmount: true,
      createdAt: true,
    },
  })
}

/**
 * Atomically update payment status and order status in a database transaction.
 */
export const transactionUpdatePaymentAndOrder = async (paymentId, paymentData, orderId, orderStatus) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: paymentData,
    })

    let order = null
    if (orderId && orderStatus) {
      order = await tx.order.update({
        where: { id: orderId },
        data: { status: orderStatus },
      })
    }

    return { payment, order }
  })
}
