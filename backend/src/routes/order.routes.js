import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import * as orderController from '../controllers/order.controller.js'
import * as reviewController from '../controllers/review.controller.js'
import {
  createOrderSchema,
  getOrdersSchema,
  getOrderByIdSchema,
} from '../validators/order.validator.js'
import { createReviewSchema } from '../validators/review.validator.js'

const router = Router()

// All order endpoints require customer authentication
router.use(authenticate)
router.use(authorize('CUSTOMER'))

router.post('/', validate(createOrderSchema), orderController.createOrder)
router.get('/', validate(getOrdersSchema), orderController.getOrders)
router.get('/:id', validate(getOrderByIdSchema), orderController.getOrderById)

// Review submission for a specific completed order
router.post('/:id/review', validate(createReviewSchema), reviewController.createReview)

export default router
