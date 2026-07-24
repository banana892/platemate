import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { paymentVerifyLimiter, webhookLimiter } from '../middleware/rateLimiter.js'
import * as paymentController from '../controllers/payment.controller.js'
import {
  createPaymentSchema,
  verifyPaymentSchema,
  refundSchema,
  paymentHistoryFiltersSchema,
  paymentAnalyticsFiltersSchema,
  idParamSchema,
} from '../validators/payment.validator.js'

const paymentRouter = Router()
const adminPaymentRouter = Router()

// ── 1. Customer / Partner / Rider Payment Routes ─────────────────────────────

paymentRouter.post(
  '/create-order',
  authenticate,
  validate(createPaymentSchema),
  paymentController.createPaymentOrder
)

paymentRouter.post(
  '/verify',
  authenticate,
  paymentVerifyLimiter, // Dedicated limiter: 10 attempts per 10 minutes (Phase 13)
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
)

paymentRouter.get(
  '/history',
  authenticate,
  validate(paymentHistoryFiltersSchema),
  paymentController.getHistory
)

paymentRouter.get(
  '/:id',
  authenticate,
  validate(idParamSchema),
  paymentController.getPaymentById
)

paymentRouter.post(
  '/:id/refund',
  authenticate,
  authorize('ADMIN'),
  validate(refundSchema),
  paymentController.refundPayment
)

// ── 2. Public Webhook Handler (No Authentication) ────────────────────────────

paymentRouter.post('/webhook', webhookLimiter, paymentController.processWebhook)

// ── 3. Admin-Specific Payment Routes (/admin/payments prefix) ────────────────

adminPaymentRouter.use(authenticate)
adminPaymentRouter.use(authorize('ADMIN'))

adminPaymentRouter.get(
  '/',
  validate(paymentHistoryFiltersSchema),
  paymentController.getAdminPayments
)

adminPaymentRouter.get(
  '/analytics',
  validate(paymentAnalyticsFiltersSchema),
  paymentController.getPaymentAnalytics
)

export { paymentRouter, adminPaymentRouter }
