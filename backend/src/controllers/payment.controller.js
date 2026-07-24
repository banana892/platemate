/**
 * payment.controller.js — Thin HTTP controller handlers for Payment System (Phase 10)
 *
 * All request inputs are parsed and routed to payment.service.js.
 */

import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as paymentService from '../services/payment.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

// ── 1. Customer Payment Routes ───────────────────────────────────────────────

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const data = await paymentService.initializePayment(req.user.id, req.body.orderId, req.body.method)
  res.status(HTTP.CREATED).json({
    success: true,
    message: MSG.PAYMENT_INITIALIZED,
    data,
  })
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.verifyPayment(req.user.id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_VERIFIED,
    data,
  })
})

export const getHistory = asyncHandler(async (req, res) => {
  const data = await paymentService.getHistory(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_HISTORY_FETCHED,
    data,
  })
})

export const getPaymentById = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentById(req.params.id, req.user.id, req.user.role)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_HISTORY_FETCHED, // Reusing detail fetch message
    data,
  })
})

// ── 2. Webhook Processing ────────────────────────────────────────────────────

export const processWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature']
  const data = await paymentService.processWebhook(signature, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_WEBHOOK_PROCESSED,
    data,
  })
})

// ── 3. Admin Payment Routes ──────────────────────────────────────────────────

export const refundPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.refundPayment(req.params.id, req.body.amount, req.body.reason)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_REFUNDED,
    data,
  })
})

export const getAdminPayments = asyncHandler(async (req, res) => {
  const data = await paymentService.getAdminPayments(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_HISTORY_FETCHED,
    data,
  })
})

export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const data = await paymentService.getAnalytics(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.PAYMENT_ANALYTICS_FETCHED,
    data,
  })
})
