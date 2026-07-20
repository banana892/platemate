import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import * as cartController from '../controllers/cart.controller.js'
import {
  addCartItemSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  applyCouponSchema,
} from '../validators/cart.validator.js'

const router = Router()

// All cart endpoints require customer authentication
router.use(authenticate)
router.use(authorize('CUSTOMER'))

router.get('/', cartController.getCart)
router.post('/items', validate(addCartItemSchema), cartController.addItem)
router.patch('/items/:id', validate(updateCartItemSchema), cartController.updateItem)
router.delete('/items/:id', validate(removeCartItemSchema), cartController.removeItem)
router.delete('/', cartController.clearCart)
router.post('/apply-coupon', validate(applyCouponSchema), cartController.applyCoupon)

export default router
