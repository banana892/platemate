/**
 * routes/index.js — Route Aggregator
 *
 * This file is the single mount point for ALL API routes.
 * app.js imports this and mounts it at /api/v1.
 *
 * WHY AGGREGATE?
 * Without this, app.js becomes cluttered with 15+ route imports and mounts.
 * This keeps app.js clean and makes it easy to see the full API surface.
 *
 * VERSIONING STRATEGY:
 * /api/v1/... — current version
 * /api/v2/... — future (parallel, non-breaking)
 *
 * When you release v2, you add /api/v2 routes alongside v1.
 * Existing clients using v1 continue to work. This is how production APIs
 * maintain backward compatibility.
 */

import { Router } from 'express'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import restaurantRoutes from './restaurant.routes.js'
import cartRoutes from './cart.routes.js'
import addressRoutes from './address.routes.js'
import favoriteRoutes from './favorite.routes.js'
import couponRoutes from './coupon.routes.js'
import checkoutRoutes from './checkout.routes.js'
import orderRoutes from './order.routes.js'
import searchRoutes from './search.routes.js'
import partnerRoutes from './partner.routes.js'
import riderRoutes from './rider.routes.js'
import adminRoutes from './admin.routes.js'
import { paymentRouter, adminPaymentRouter } from './payment.routes.js'

import { getHealth } from '../controllers/health.controller.js'

const router = Router()

// ── Health Check ──────────────────────────────────────────────────────────────
router.get('/health', getHealth)

// ── API Routes ────────────────────────────────────────────────────────────────
// Routes are added here as each phase is implemented.
// Commented routes show what's coming — helps you see the full picture.

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/restaurants', restaurantRoutes)

// Phase 5 — Customer APIs (added in Phase 5)
router.use('/cart', cartRoutes)
router.use('/addresses', addressRoutes)
router.use('/favorites', favoriteRoutes)
router.use('/coupons', couponRoutes)
router.use('/checkout', checkoutRoutes)
router.use('/orders', orderRoutes)
router.use('/search', searchRoutes)
// router.use('/notifications', notificationRoutes)

// Phase 6 — Partner APIs
router.use('/partner', partnerRoutes)

// Phase 7 — Rider APIs
router.use('/rider', riderRoutes)

// Phase 8 — Admin APIs
router.use('/admin', adminRoutes)

// Phase 10 — Payments
router.use('/payments', paymentRouter)
router.use('/admin/payments', adminPaymentRouter)

// Phase 12 — Media & File Management
import mediaRoutes from './media.routes.js'
router.use('/media', mediaRoutes)

export default router
