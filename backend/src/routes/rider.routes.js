/**
 * rider.routes.js — Delivery Partner API Routes (Phase 7)
 *
 * All routes require:
 *   1. authenticate()  — valid JWT with a RIDER account
 *   2. authorize('RIDER') — role check
 *   3. resolveRider    — resolves rider context onto req.riderId (convenience)
 *
 * Route surface:
 *
 *   GET    /rider/dashboard                 — Rider dashboard stats
 *   GET    /rider/profile                   — Rider profile
 *   PUT    /rider/profile                   — Update rider profile
 *   GET    /rider/status                    — Availability status
 *   PATCH  /rider/status                    — Update availability
 *   GET    /rider/orders                    — Active deliveries (paginated)
 *   GET    /rider/orders/:id                — Single delivery detail
 *   PATCH  /rider/orders/:id/status         — Update delivery status
 *   GET    /rider/history                   — Delivery history
 *   GET    /rider/earnings                  — Earnings breakdown
 *   GET    /rider/analytics                 — Rider analytics
 *   GET    /rider/notifications             — Notifications
 *   PATCH  /rider/notifications/read-all    — Mark all notifications read
 *   PATCH  /rider/notifications/:id/read    — Mark one notification read
 *
 * NOTE: read-all route MUST be registered BEFORE :id/read to avoid
 *       "read-all" being parsed as a notification ID.
 */

import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'

import * as riderController from '../controllers/rider.controller.js'
import {
  updateRiderProfileSchema,
  updateRiderStatusSchema,
  updateDeliveryStatusSchema,
  listActiveOrdersSchema,
  historyFilterSchema,
  earningsFilterSchema,
  analyticsFilterSchema,
  notificationIdSchema,
} from '../validators/rider.validator.js'

const router = Router()

// ── 1. Global Auth Guards ─────────────────────────────────────────────────────
// Every route in this file requires a valid RIDER token.
router.use(authenticate)
router.use(authorize('RIDER'))

// ── 2. Dashboard ──────────────────────────────────────────────────────────────

router.get('/dashboard', riderController.getDashboard)

// ── 3. Profile ────────────────────────────────────────────────────────────────

router.get('/profile', riderController.getProfile)
router.put('/profile', validate(updateRiderProfileSchema), riderController.updateProfile)

// ── 4. Availability Status ─────────────────────────────────────────────────────

router.get('/status', riderController.getRiderStatus)
router.patch('/status', validate(updateRiderStatusSchema), riderController.updateRiderStatus)

// ── 5. Active Deliveries ───────────────────────────────────────────────────────

router.get('/orders', validate(listActiveOrdersSchema), riderController.getActiveOrders)
router.get('/orders/:id', riderController.getOrderById)

// ── 6. Delivery Status Update ──────────────────────────────────────────────────

router.patch(
  '/orders/:id/status',
  validate(updateDeliveryStatusSchema),
  riderController.updateDeliveryStatus
)

// ── 7. Delivery History ────────────────────────────────────────────────────────

router.get('/history', validate(historyFilterSchema), riderController.getDeliveryHistory)

// ── 8. Earnings ───────────────────────────────────────────────────────────────

router.get('/earnings', validate(earningsFilterSchema), riderController.getEarnings)

// ── 9. Analytics ──────────────────────────────────────────────────────────────

router.get('/analytics', validate(analyticsFilterSchema), riderController.getAnalytics)

// ── 10. Notifications ─────────────────────────────────────────────────────────
// IMPORTANT: /read-all must be before /:id/read to avoid route conflict
router.get('/notifications', riderController.getNotifications)
router.patch('/notifications/read-all', riderController.markAllNotificationsRead)
router.patch(
  '/notifications/:id/read',
  validate(notificationIdSchema),
  riderController.markNotificationRead
)

export default router
