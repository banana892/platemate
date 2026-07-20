import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as couponController from '../controllers/coupon.controller.js'

const router = Router()

// Coupon endpoints require authentication
router.use(authenticate)

router.get('/available', couponController.getAvailableCoupons)

export default router
