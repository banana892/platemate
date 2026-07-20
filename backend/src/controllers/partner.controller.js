import { HTTP } from '../constants/httpStatus.js'
import * as partnerService from '../services/partner.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

// ── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboard = asyncHandler(async (req, res) => {
  const result = await partnerService.getDashboard(req.restaurantId)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  })
})

// ── Profile & Settings ────────────────────────────────────────────────────────

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await partnerService.getProfile(req.restaurantId)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: profile,
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await partnerService.updateProfile(req.restaurantId, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: profile,
  })
})

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await partnerService.getSettings(req.restaurantId)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Operational settings retrieved successfully',
    data: settings,
  })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await partnerService.updateSettings(req.restaurantId, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Operational settings updated successfully',
    data: settings,
  })
})

// ── Business Hours ────────────────────────────────────────────────────────────

export const getBusinessHours = asyncHandler(async (req, res) => {
  const hours = await partnerService.getBusinessHours(req.restaurantId)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Business hours retrieved successfully',
    data: hours,
  })
})

export const updateBusinessHours = asyncHandler(async (req, res) => {
  const hours = await partnerService.updateBusinessHours(req.restaurantId, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Business hours updated successfully',
    data: hours,
  })
})

// ── Menu Categories ───────────────────────────────────────────────────────────

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await partnerService.getCategories(req.restaurantId)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu categories retrieved successfully',
    data: categories,
  })
})

export const createCategory = asyncHandler(async (req, res) => {
  const category = await partnerService.createCategory(req.restaurantId, req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: 'Menu category created successfully',
    data: category,
  })
})

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const category = await partnerService.updateCategory(req.restaurantId, id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu category updated successfully',
    data: category,
  })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await partnerService.deleteCategory(req.restaurantId, id)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu category deleted successfully',
    data: result,
  })
})

// ── Menu Items ────────────────────────────────────────────────────────────────

export const getMenuItems = asyncHandler(async (req, res) => {
  const result = await partnerService.getMenuItems(req.restaurantId, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu items retrieved successfully',
    data: result,
  })
})

export const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const item = await partnerService.getMenuItemById(req.restaurantId, id)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu item details retrieved successfully',
    data: item,
  })
})

export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await partnerService.createMenuItem(req.restaurantId, req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: 'Menu item created successfully',
    data: item,
  })
})

export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const item = await partnerService.updateMenuItem(req.restaurantId, id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu item updated successfully',
    data: item,
  })
})

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await partnerService.deleteMenuItem(req.restaurantId, id)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Menu item deleted successfully (soft delete)',
    data: result,
  })
})

export const updateMenuItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { isAvailable } = req.body
  const item = await partnerService.updateMenuItemAvailability(req.restaurantId, id, isAvailable)
  res.status(HTTP.OK).json({
    success: true,
    message: `Menu item availability updated to ${isAvailable}`,
    data: item,
  })
})

// ── Restaurant Availability Toggles ──────────────────────────────────────────

export const openRestaurant = asyncHandler(async (req, res) => {
  const result = await partnerService.toggleRestaurantAvailability(req.restaurantId, true)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Restaurant is now open for ordering',
    data: result,
  })
})

export const closeRestaurant = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const result = await partnerService.toggleRestaurantAvailability(req.restaurantId, false, reason)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Restaurant is now closed for ordering',
    data: result,
  })
})

// ── Order Management ─────────────────────────────────────────────────────────

export const getOrders = asyncHandler(async (req, res) => {
  const result = await partnerService.getOrders(req.restaurantId, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Restaurant orders retrieved successfully',
    data: result,
  })
})

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const order = await partnerService.getOrderById(req.restaurantId, id)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Order details retrieved successfully',
    data: order,
  })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const result = await partnerService.updateOrderStatus(req.restaurantId, id, status)
  res.status(HTTP.OK).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: result,
  })
})

// ── Restaurant Analytics ──────────────────────────────────────────────────────

export const getAnalytics = asyncHandler(async (req, res) => {
  const result = await partnerService.getAnalytics(req.restaurantId, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Analytics data compiled successfully',
    data: result,
  })
})

// ── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await partnerService.getNotifications(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Partner notifications retrieved successfully',
    data: result,
  })
})

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await partnerService.markNotificationRead(req.user.id, id)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Notification marked as read',
    data: { id: result.id },
  })
})
