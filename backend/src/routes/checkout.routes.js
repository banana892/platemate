import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import * as checkoutController from '../controllers/checkout.controller.js'
import { checkoutValidateSchema } from '../validators/order.validator.js'

const router = Router()

// All checkout validation endpoints require customer authentication
router.use(authenticate)
router.use(authorize('CUSTOMER'))

router.post('/validate', validate(checkoutValidateSchema), checkoutController.validateCheckout)

export default router
