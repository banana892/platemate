import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import * as favoriteController from '../controllers/favorite.controller.js'

const router = Router()

// All favorites endpoints require customer authentication
router.use(authenticate)
router.use(authorize('CUSTOMER'))

router.get('/', favoriteController.getFavorites)
router.post('/:restaurantId', favoriteController.addFavorite)
router.delete('/:restaurantId', favoriteController.removeFavorite)

export default router
