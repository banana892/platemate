import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import * as searchController from '../controllers/search.controller.js'
import { searchSchema } from '../validators/search.validator.js'

const router = Router()

// Public search endpoint
router.get('/', validate(searchSchema), searchController.search)

export default router
