/**
 * payment.service.js — Business Logic for Payment System (Phase 10)
 *
 * Implements provider abstraction, idempotency, webhook parsing, and refund checks.
 */

import crypto from 'crypto'
import prisma from '../config/db.js'
import * as paymentRepo from '../repositories/payment.repository.js'
import RazorpayProvider from '../providers/razorpay.provider.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

// Initialize default provider (Razorpay)
const gatewayProvider = new RazorpayProvider()

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const emitSocketPaymentUpdate = async (userId, eventName, data) => {
  try {
    const { emitToUser } = await import('../socket/socket.events.js')
    emitToUser(userId, eventName, data)
  } catch (err) {
    logger.debug({ userId, err: err.message }, 'Socket provider not initialized yet — skipping real-time notice')
  }
}

// ── 1. Payment Initialization ────────────────────────────────────────────────

export const initializePayment = async (userId, orderId, method) => {
  // 1. Fetch Order and assert existence
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  })

  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  if (order.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  // 2. Prevent duplicate payment initialization if already CAPTURED/paid
  if (order.payment && (order.payment.status === 'CAPTURED' || order.payment.status === 'REFUNDED')) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.PAYMENT_ALREADY_PAID)
  }

  // 3. Bypass gateway for COD (Cash on Delivery)
  if (method === 'COD') {
    const paymentData = {
      orderId: order.id,
      userId,
      provider: 'COD',
      amount: order.totalAmount,
      status: 'PENDING',
      method: 'COD',
    }

    let payment = order.payment
    if (payment) {
      payment = await paymentRepo.updatePayment(payment.id, paymentData)
    } else {
      payment = await paymentRepo.createPayment(paymentData)
    }

    // Automatically transition order to CONFIRMED for COD
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
    })

    // Clear user's cart on COD order confirmation
    await prisma.cart.deleteMany({ where: { userId } }).catch(() => {})

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount: Number(payment.amount),
      status: payment.status,
      provider: 'COD',
    }
  }

  // 4. Online Payment: Create gateway order (Razorpay)
  const rzpOrder = await gatewayProvider.createOrder(order.id, order.totalAmount)

  const paymentData = {
    orderId: order.id,
    userId,
    provider: 'RAZORPAY',
    providerOrderId: rzpOrder.providerOrderId,
    amount: order.totalAmount,
    status: 'PENDING',
    method,
  }

  let payment = order.payment
  if (payment) {
    payment = await paymentRepo.updatePayment(payment.id, paymentData)
  } else {
    payment = await paymentRepo.createPayment(paymentData)
  }

  return {
    paymentId: payment.id,
    orderId: order.id,
    amount: Number(payment.amount),
    currency: payment.currency || 'INR',
    status: payment.status,
    provider: 'RAZORPAY',
    providerOrderId: rzpOrder.providerOrderId,
    keyId: env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid',
  }
}

// ── 2. Payment Verification ──────────────────────────────────────────────────

export const verifyPayment = async (userId, data) => {
  const { providerPaymentId, providerOrderId, providerSignature } = data

  // 1. Find the payment record
  const payment = await paymentRepo.findPaymentByProviderOrderId(providerOrderId)
  if (!payment) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.PAYMENT_NOT_FOUND)
  }

  // Idempotency: If already captured, return success immediately
  if (payment.status === 'CAPTURED') {
    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: 'CAPTURED',
    }
  }

  // 2. Cryptographic signature check
  const isValid = gatewayProvider.verifySignature(providerOrderId, providerPaymentId, providerSignature)
  if (!isValid) {
    logger.warn({ providerOrderId, providerPaymentId }, 'Suspicious payment signature failure!')
    await paymentRepo.updatePayment(payment.id, {
      status: 'FAILED',
      failureReason: MSG.PAYMENT_INVALID_SIGNATURE,
    })
    throw new ApiError(HTTP.BAD_REQUEST, MSG.PAYMENT_INVALID_SIGNATURE)
  }

  // 3. Atomically update DB state using a transaction
  const result = await paymentRepo.transactionUpdatePaymentAndOrder(
    payment.id,
    {
      status: 'CAPTURED',
      providerPaymentId,
      providerSignature,
    },
    payment.orderId,
    'CONFIRMED'
  )

  // 4. Emit live update socket events
  const { EVENTS } = await import('../socket/socket.constants.js')
  emitSocketPaymentUpdate(userId, EVENTS.PAYMENT_SUCCESS, {
    paymentId: payment.id,
    orderId: payment.orderId,
    status: 'CAPTURED',
  })

  return {
    paymentId: result.payment.id,
    orderId: result.payment.orderId,
    status: result.payment.status,
  }
}

// ── 3. Webhook Processing ────────────────────────────────────────────────────

export const processWebhook = async (signature, payloadBody) => {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'dummywebhooksecret'

  // 1. Verify webhook signature using timing-safe comparison
  // String equality (===) is vulnerable to timing attacks that can reveal
  // the signature byte-by-byte through response time differences.
  // timingSafeEqual() always takes the same amount of time regardless of match.
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(typeof payloadBody === 'string' ? payloadBody : JSON.stringify(payloadBody))
    .digest('hex')

  const expectedBuf = Buffer.from(expectedSignature, 'hex')
  const receivedBuf = Buffer.from(signature || '', 'hex')

  const isValidSignature =
    expectedBuf.length === receivedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, receivedBuf)

  if (!isValidSignature) {
    logger.warn('Suspicious webhook payload: signature mismatch')
    throw new ApiError(HTTP.BAD_REQUEST, 'Invalid webhook signature')
  }

  const payload = typeof payloadBody === 'string' ? JSON.parse(payloadBody) : payloadBody
  const event = payload.event
  const paymentObj = payload.payload?.payment?.entity

  if (!paymentObj) {
    logger.warn('Webhook payload contains no payment entity — ignoring')
    return { status: 'ignored' }
  }

  const providerOrderId = paymentObj.order_id
  const providerPaymentId = paymentObj.id

  // 2. Fetch the corresponding internal payment record
  const payment = await paymentRepo.findPaymentByProviderOrderId(providerOrderId)
  if (!payment) {
    logger.warn({ providerOrderId }, 'Webhook payment order reference not found — ignoring')
    return { status: 'not_found' }
  }

  // 3. Idempotent check
  const eventMapping = {
    'payment.authorized': 'AUTHORIZED',
    'payment.captured': 'CAPTURED',
    'payment.failed': 'FAILED',
    'refund.processed': 'REFUNDED',
  }

  const targetStatus = eventMapping[event]
  if (!targetStatus || payment.status === targetStatus) {
    // If status matches or is unrecognized, skip processing (idempotency check)
    return { status: 'skipped_idempotent' }
  }

  // 4. State updates based on event type
  const { EVENTS } = await import('../socket/socket.constants.js')

  if (event === 'payment.captured' || event === 'order.paid') {
    await paymentRepo.transactionUpdatePaymentAndOrder(
      payment.id,
      {
        status: 'CAPTURED',
        providerPaymentId,
        metadata: paymentObj,
      },
      payment.orderId,
      'CONFIRMED'
    )
    emitSocketPaymentUpdate(payment.userId, EVENTS.PAYMENT_SUCCESS, {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: 'CAPTURED',
    })
  } else if (event === 'payment.failed') {
    await paymentRepo.updatePayment(payment.id, {
      status: 'FAILED',
      failureReason: paymentObj.error_description || 'Gateway transaction failed',
      metadata: paymentObj,
    })
    emitSocketPaymentUpdate(payment.userId, EVENTS.PAYMENT_FAILED, {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: 'FAILED',
      reason: paymentObj.error_description,
    })
  } else if (event === 'refund.processed') {
    const refundObj = payload.payload?.refund?.entity
    const refundAmount = refundObj ? Number(refundObj.amount) / 100 : Number(payment.amount)
    
    let nextStatus = 'REFUNDED'
    const newRefundTotal = Number(payment.refundAmount) + refundAmount
    if (newRefundTotal < Number(payment.amount)) {
      nextStatus = 'PARTIALLY_REFUNDED'
    }

    await paymentRepo.updatePayment(payment.id, {
      status: nextStatus,
      refundAmount: newRefundTotal,
      refundedAt: new Date(),
      metadata: { ...(payment.metadata || {}), webhookRefund: refundObj },
    })

    emitSocketPaymentUpdate(payment.userId, EVENTS.PAYMENT_REFUNDED, {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: nextStatus,
      refundAmount: newRefundTotal,
    })
  }

  return { status: 'processed', event }
}

// ── 4. Refunds ───────────────────────────────────────────────────────────────

export const refundPayment = async (paymentId, amount, reason) => {
  const payment = await paymentRepo.findPaymentById(paymentId)
  if (!payment) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.PAYMENT_NOT_FOUND)
  }

  // Business Rules:
  // - Paid orders can be refunded, or Cancelled orders
  if (payment.status !== 'CAPTURED' && payment.status !== 'PARTIALLY_REFUNDED') {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.PAYMENT_REFUND_NOT_ALLOWED)
  }

  const refundAmt = amount !== undefined ? Number(amount) : Number(payment.amount) - Number(payment.refundAmount)

  if (refundAmt <= 0) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Refund amount must be positive')
  }

  // Ensure total refund doesn't exceed captured amount
  const proposedRefundTotal = Number(payment.refundAmount) + refundAmt
  if (proposedRefundTotal > Number(payment.amount)) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.PAYMENT_REFUND_EXCEEDED)
  }

  // Process gateway refund for online provider (skip for COD)
  let providerRefundResult = null
  if (payment.provider === 'RAZORPAY' && payment.providerPaymentId) {
    providerRefundResult = await gatewayProvider.refund(payment.providerPaymentId, refundAmt, {
      reason,
      orderId: payment.orderId,
    })
  }

  // Determine next payment status
  const nextStatus = proposedRefundTotal < Number(payment.amount) ? 'PARTIALLY_REFUNDED' : 'REFUNDED'

  // Update DB state
  const updated = await paymentRepo.updatePayment(payment.id, {
    status: nextStatus,
    refundAmount: proposedRefundTotal,
    refundedAt: new Date(),
    metadata: {
      ...(payment.metadata || {}),
      refundLogs: [
        ...(payment.metadata?.refundLogs || []),
        { amount: refundAmt, reason, date: new Date().toISOString(), result: providerRefundResult },
      ],
    },
  })

  // Emit real-time notification
  const { EVENTS } = await import('../socket/socket.constants.js')
  emitSocketPaymentUpdate(payment.userId, EVENTS.PAYMENT_REFUNDED, {
    paymentId: payment.id,
    orderId: payment.orderId,
    status: nextStatus,
    refundAmount: proposedRefundTotal,
  })

  return {
    id: updated.id,
    status: updated.status,
    refundAmount: Number(updated.refundAmount),
    refundedAt: updated.refundedAt,
  }
}

// ── 5. Payment Queries & History ─────────────────────────────────────────────

export const getHistory = async (userId, query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { status, provider, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await paymentRepo.findCustomerPayments(userId, {
    skip,
    take,
    status,
    provider,
    sortBy,
    order,
  })

  return {
    payments: items.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order.orderNumber,
      amount: Number(p.amount),
      status: p.status,
      provider: p.provider,
      method: p.method,
      createdAt: p.createdAt,
    })),
    pagination: buildMeta(total, page, limit),
  }
}

export const getPaymentById = async (id, userId, role) => {
  const payment = await paymentRepo.findPaymentById(id)
  if (!payment) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.PAYMENT_NOT_FOUND)
  }

  // Authorize: Only the owner or an ADMIN can view this payment detail
  if (payment.userId !== userId && role !== 'ADMIN') {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  return {
    ...payment,
    amount: Number(payment.amount),
    refundAmount: Number(payment.refundAmount),
  }
}

export const getAdminPayments = async (query) => {
  const { skip, take, page, limit } = parsePagination(query)
  const { status, provider, sortBy = 'createdAt', order = 'desc' } = query

  const { items, total } = await paymentRepo.findAdminPayments({
    skip,
    take,
    status,
    provider,
    sortBy,
    order,
  })

  return {
    payments: items.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order.orderNumber,
      userId: p.userId,
      customerName: p.user?.name || 'Unknown',
      amount: Number(p.amount),
      status: p.status,
      provider: p.provider,
      method: p.method,
      createdAt: p.createdAt,
    })),
    pagination: buildMeta(total, page, limit),
  }
}

export const getAnalytics = async (query) => {
  const { range = 'month', startDate, endDate } = query
  const { start, end } = getRangeDates(range, startDate, endDate)

  const payments = await paymentRepo.findPaymentsForAnalytics(start, end)

  // Aggregate stats
  let totalVolume = 0
  let capturedVolume = 0
  let refundVolume = 0
  let capturedCount = 0
  let failedCount = 0
  const methodDistribution = {}

  payments.forEach((p) => {
    const amount = Number(p.amount)
    totalVolume += amount

    if (p.status === 'CAPTURED' || p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED') {
      capturedVolume += amount
      capturedCount++
      refundVolume += Number(p.refundAmount || 0)
    } else if (p.status === 'FAILED') {
      failedCount++
    }

    methodDistribution[p.method] = (methodDistribution[p.method] || 0) + 1
  })

  return {
    period: {
      range,
      from: start.toISOString(),
      to: end.toISOString(),
    },
    summary: {
      totalInitiatedVolume: parseFloat(totalVolume.toFixed(2)),
      capturedVolume: parseFloat(capturedVolume.toFixed(2)),
      refundedVolume: parseFloat(refundVolume.toFixed(2)),
      netRevenue: parseFloat((capturedVolume - refundVolume).toFixed(2)),
      capturedCount,
      failedCount,
      successRate: capturedCount + failedCount > 0 ? parseFloat((capturedCount / (capturedCount + failedCount) * 100).toFixed(1)) : 100,
    },
    methodDistribution,
  }
}
