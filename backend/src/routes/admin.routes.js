/**
 * admin.routes.js — Admin Panel API Routes (Phase 8)
 *
 * Every route in this file requires authenticate + authorize('ADMIN').
 */

import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'

import * as adminController from '../controllers/admin.controller.js'
import {
  customerFiltersSchema,
  customerStatusSchema,
  restaurantFiltersSchema,
  riderFiltersSchema,
  orderFiltersSchema,
  cancelOrderSchema,
  reviewFiltersSchema,
  couponCreateSchema,
  couponUpdateSchema,
  cuisineCreateSchema,
  cuisineUpdateSchema,
  analyticsFiltersSchema,
  broadcastNotificationSchema,
  platformSettingsSchema,
  idParamSchema,
  auditLogQuerySchema,
} from '../validators/admin.validator.js'

const router = Router()

// Global Auth Guards - Admins only
router.use(authenticate)
router.use(authorize('ADMIN'))

// ── 1. Dashboard ─────────────────────────────────────────────────────────────

router.get('/dashboard', adminController.getDashboard)

// ── 2. Customer Management ───────────────────────────────────────────────────

router.get('/customers', validate(customerFiltersSchema), adminController.getCustomers)
router.get('/customers/:id', validate(idParamSchema), adminController.getCustomerById)
router.patch('/customers/:id/status', validate(customerStatusSchema), adminController.updateCustomerStatus)

// ── 3. Restaurant Management ─────────────────────────────────────────────────

router.get('/restaurants', validate(restaurantFiltersSchema), adminController.getRestaurants)
router.get('/restaurants/:id', validate(idParamSchema), adminController.getRestaurantById)
router.patch('/restaurants/:id/approve', validate(idParamSchema), adminController.approveRestaurant)
router.patch('/restaurants/:id/reject', validate(idParamSchema), adminController.rejectRestaurant)
router.patch('/restaurants/:id/suspend', validate(idParamSchema), adminController.suspendRestaurant)
router.patch('/restaurants/:id/activate', validate(idParamSchema), adminController.activateRestaurant)

// ── 4. Rider Management ──────────────────────────────────────────────────────

router.get('/riders', validate(riderFiltersSchema), adminController.getRiders)
router.get('/riders/:id', validate(idParamSchema), adminController.getRiderById)
router.patch('/riders/:id/approve', validate(idParamSchema), adminController.approveRider)
router.patch('/riders/:id/reject', validate(idParamSchema), adminController.rejectRider)
router.patch('/riders/:id/suspend', validate(idParamSchema), adminController.suspendRider)
router.patch('/riders/:id/activate', validate(idParamSchema), adminController.activateRider)

// ── 5. Order Management ──────────────────────────────────────────────────────

router.get('/orders', validate(orderFiltersSchema), adminController.getOrders)
router.get('/orders/:id', validate(idParamSchema), adminController.getOrderById)
router.patch('/orders/:id/cancel', validate(cancelOrderSchema), adminController.cancelOrder)

// ── 6. Review Moderation ─────────────────────────────────────────────────────

router.get('/reviews', validate(reviewFiltersSchema), adminController.getReviews)
router.patch('/reviews/:id/hide', validate(idParamSchema), adminController.hideReview)
router.patch('/reviews/:id/restore', validate(idParamSchema), adminController.restoreReview)

// ── 7. Coupon Management ─────────────────────────────────────────────────────

router.get('/coupons', adminController.getCoupons)
router.get('/coupons/:id', validate(idParamSchema), adminController.getCouponById)
router.post('/coupons', validate(couponCreateSchema), adminController.createCoupon)
router.put('/coupons/:id', validate(couponUpdateSchema), adminController.updateCoupon)
router.delete('/coupons/:id', validate(idParamSchema), adminController.deleteCoupon)

// ── 8. Category (Cuisine) Management ────────────────────────────────────────

router.get('/cuisines', adminController.getCuisines)
router.post('/cuisines', validate(cuisineCreateSchema), adminController.createCuisine)
router.put('/cuisines/:id', validate(cuisineUpdateSchema), adminController.updateCuisine)
router.delete('/cuisines/:id', validate(idParamSchema), adminController.deleteCuisine)

// ── 9. Analytics ─────────────────────────────────────────────────────────────

router.get('/analytics', validate(analyticsFiltersSchema), adminController.getAnalytics)

// ── 10. Notifications ────────────────────────────────────────────────────────

router.get('/notifications', adminController.getNotifications)
router.post('/notifications', validate(broadcastNotificationSchema), adminController.broadcastNotification)

// ── 11. Platform Settings ────────────────────────────────────────────────────

router.get('/settings', adminController.getSettings)
router.patch('/settings', validate(platformSettingsSchema), adminController.updateSettings)

// ── 12. Audit Logs (Phase 13) ────────────────────────────────────────────────

router.get('/audit-logs', validate(auditLogQuerySchema), adminController.getAuditLogs)

export default router

