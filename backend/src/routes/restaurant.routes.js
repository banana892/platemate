/**
 * restaurant.routes.js — Public Restaurant Route Definitions
 *
 * GET  /restaurants              — list all (paginated, filtered, sorted)
 * GET  /restaurants/featured     — featured/promoted restaurants
 * GET  /restaurants/search       — full-text search
 * GET  /restaurants/:slug        — single restaurant details + menu
 * GET  /restaurants/:slug/menu   — just the menu
 * GET  /restaurants/:slug/reviews— restaurant reviews
 */

import { Router } from 'express'
import { optionalAuthenticate } from '../middleware/auth.js'
import * as restaurantController from '../controllers/restaurant.controller.js'

const router = Router()

// Optional auth: logged-in users see "favorited" state
router.use(optionalAuthenticate)

router.get('/', restaurantController.listRestaurants)
router.get('/featured', restaurantController.getFeatured)
router.get('/search', restaurantController.searchRestaurants)
router.get('/:slug', restaurantController.getRestaurant)
router.get('/:slug/menu', restaurantController.getMenu)
router.get('/:slug/reviews', restaurantController.getReviews)

export default router
