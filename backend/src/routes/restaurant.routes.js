import { Router } from 'express'
import { optionalAuthenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import * as restaurantController from '../controllers/restaurant.controller.js'
import {
  listRestaurantsSchema,
  getRestaurantSchema,
  getMenuSchema,
  getReviewsSchema,
} from '../validators/restaurant.validator.js'

const router = Router()

// Optional auth: logged-in users see "favorited" state
router.use(optionalAuthenticate)

router.get('/', validate(listRestaurantsSchema), restaurantController.listRestaurants)
router.get('/featured', restaurantController.getFeatured)
router.get('/search', restaurantController.searchRestaurants)
router.get('/:slug', validate(getRestaurantSchema), restaurantController.getRestaurant)
router.get('/:slug/menu', validate(getMenuSchema), restaurantController.getMenu)
router.get('/:slug/reviews', validate(getReviewsSchema), restaurantController.getReviews)

export default router
