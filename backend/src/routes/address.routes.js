import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import * as addressController from '../controllers/address.controller.js'
import {
  createAddressSchema,
  updateAddressSchema,
  getAddressSchema,
  deleteAddressSchema,
  setDefaultAddressSchema,
} from '../validators/address.validator.js'

const router = Router()

// All address endpoints require customer authentication
router.use(authenticate)
router.use(authorize('CUSTOMER'))

router.get('/', addressController.getAddresses)
router.get('/:id', validate(getAddressSchema), addressController.getAddressById)
router.post('/', validate(createAddressSchema), addressController.createAddress)
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress)
router.patch('/:id/default', validate(setDefaultAddressSchema), addressController.setDefaultAddress)
router.delete('/:id', validate(deleteAddressSchema), addressController.deleteAddress)

export default router

