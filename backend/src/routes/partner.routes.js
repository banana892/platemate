import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import prisma from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import asyncHandler from '../middleware/asyncHandler.js'

import * as partnerController from '../controllers/partner.controller.js'
import {
  updateProfileSchema,
  updateSettingsSchema,
  updateBusinessHoursSchema,
  categorySchema,
  updateCategorySchema,
  menuItemSchema,
  updateMenuItemSchema,
  toggleMenuItemAvailabilitySchema,
  updateOrderStatusSchema,
  analyticsFilterSchema,
} from '../validators/partner.validator.js'

const router = Router()

// ── 1. Authenticate and Role Guard ──────────────────────────────────────────
router.use(authenticate)
router.use(authorize('PARTNER'))

// ── 2. Active Restaurant Resolution Middleware ──────────────────────────────
/**
 * Resolves which restaurant the partner is currently managing.
 * Supports passing an X-Restaurant-ID header, defaulting to their first restaurant.
 */
const resolvePartnerRestaurant = asyncHandler(async (req, res, next) => {
  const owner = await prisma.restaurantOwner.findUnique({
    where: { userId: req.user.id },
    include: {
      restaurants: {
        where: { deletedAt: null },
      },
    },
  })

  if (!owner || !owner.restaurants || owner.restaurants.length === 0) {
    throw new ApiError(
      403,
      'You do not have any registered restaurants. Please register a restaurant first.'
    )
  }

  // Check header or default to first restaurant
  let activeRestaurant = owner.restaurants[0]
  const headerRestId = req.headers['x-restaurant-id']

  if (headerRestId) {
    const matched = owner.restaurants.find((r) => r.id === headerRestId)
    if (!matched) {
      throw new ApiError(403, 'You do not own the requested restaurant')
    }
    activeRestaurant = matched
  }

  req.restaurantId = activeRestaurant.id
  req.restaurant = activeRestaurant
  next()
})

// Apply restaurant resolution to all routes EXCEPT notifications
const withRestaurant = resolvePartnerRestaurant

// ── 3. Routes Wiring ──────────────────────────────────────────────────────────

// Dashboard
router.get('/dashboard', withRestaurant, partnerController.getDashboard)

// Profile
router.get('/restaurant', withRestaurant, partnerController.getProfile)
router.put('/restaurant', withRestaurant, validate(updateProfileSchema), partnerController.updateProfile)

// Settings
router.get('/settings', withRestaurant, partnerController.getSettings)
router.put('/settings', withRestaurant, validate(updateSettingsSchema), partnerController.updateSettings)

// Business Hours
router.get('/business-hours', withRestaurant, partnerController.getBusinessHours)
router.put('/business-hours', withRestaurant, validate(updateBusinessHoursSchema), partnerController.updateBusinessHours)

// Categories
router.get('/categories', withRestaurant, partnerController.getCategories)
router.post('/categories', withRestaurant, validate(categorySchema), partnerController.createCategory)
router.put('/categories/:id', withRestaurant, validate(updateCategorySchema), partnerController.updateCategory)
router.delete('/categories/:id', withRestaurant, partnerController.deleteCategory)

// Menu Items
router.get('/menu-items', withRestaurant, partnerController.getMenuItems)
router.get('/menu-items/:id', withRestaurant, partnerController.getMenuItemById)
router.post('/menu-items', withRestaurant, validate(menuItemSchema), partnerController.createMenuItem)
router.put('/menu-items/:id', withRestaurant, validate(updateMenuItemSchema), partnerController.updateMenuItem)
router.delete('/menu-items/:id', withRestaurant, partnerController.deleteMenuItem)
router.patch('/menu-items/:id/availability', withRestaurant, validate(toggleMenuItemAvailabilitySchema), partnerController.updateMenuItemAvailability)

// Availability Toggles
router.patch('/restaurant/open', withRestaurant, partnerController.openRestaurant)
router.patch('/restaurant/close', withRestaurant, partnerController.closeRestaurant)

// Orders
router.get('/orders', withRestaurant, partnerController.getOrders)
router.get('/orders/:id', withRestaurant, partnerController.getOrderById)
router.patch('/orders/:id/status', withRestaurant, validate(updateOrderStatusSchema), partnerController.updateOrderStatus)

// Analytics
router.get('/analytics', withRestaurant, validate(analyticsFilterSchema), partnerController.getAnalytics)

// Notifications (Not scoped to a single restaurant, scoped to user account)
router.get('/notifications', partnerController.getNotifications)
router.patch('/notifications/:id/read', partnerController.markNotificationRead)

export default router
