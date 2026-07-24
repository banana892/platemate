/**
 * admin.controller.js — HTTP Handler Layer for Admin (Phase 8)
 *
 * Controllers are thin: extract inputs, call the service, return response.
 */

import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as adminService from '../services/admin.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

// ── 1. Dashboard ─────────────────────────────────────────────────────────────

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboard()
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_DASHBOARD_FETCHED,
    data,
  })
})

// ── 2. Customer Management ───────────────────────────────────────────────────

export const getCustomers = asyncHandler(async (req, res) => {
  const data = await adminService.getCustomers(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_CUSTOMERS_FETCHED,
    data,
  })
})

export const getCustomerById = asyncHandler(async (req, res) => {
  const data = await adminService.getCustomerById(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_CUSTOMER_FETCHED,
    data,
  })
})

export const updateCustomerStatus = asyncHandler(async (req, res) => {
  const data = await adminService.updateCustomerStatus(req.params.id, req.body.status)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_CUSTOMER_UPDATED,
    data,
  })
})

// ── 3. Restaurant Management ─────────────────────────────────────────────────

export const getRestaurants = asyncHandler(async (req, res) => {
  const data = await adminService.getRestaurants(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RESTAURANTS_FETCHED,
    data,
  })
})

export const getRestaurantById = asyncHandler(async (req, res) => {
  const data = await adminService.getRestaurantById(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RESTAURANT_FETCHED,
    data,
  })
})

export const approveRestaurant = asyncHandler(async (req, res) => {
  const data = await adminService.approveRestaurant(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RESTAURANT_APPROVED,
    data,
  })
})

export const rejectRestaurant = asyncHandler(async (req, res) => {
  const data = await adminService.rejectRestaurant(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RESTAURANT_REJECTED,
    data,
  })
})

export const suspendRestaurant = asyncHandler(async (req, res) => {
  const data = await adminService.suspendRestaurant(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RESTAURANT_SUSPENDED,
    data,
  })
})

export const activateRestaurant = asyncHandler(async (req, res) => {
  const data = await adminService.activateRestaurant(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RESTAURANT_ACTIVATED,
    data,
  })
})

// ── 4. Rider Management ──────────────────────────────────────────────────────

export const getRiders = asyncHandler(async (req, res) => {
  const data = await adminService.getRiders(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RIDERS_FETCHED,
    data,
  })
})

export const getRiderById = asyncHandler(async (req, res) => {
  const data = await adminService.getRiderById(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RIDER_FETCHED,
    data,
  })
})

export const approveRider = asyncHandler(async (req, res) => {
  const data = await adminService.approveRider(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RIDER_APPROVED,
    data,
  })
})

export const rejectRider = asyncHandler(async (req, res) => {
  const data = await adminService.rejectRider(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RIDER_REJECTED,
    data,
  })
})

export const suspendRider = asyncHandler(async (req, res) => {
  const data = await adminService.suspendRider(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RIDER_SUSPENDED,
    data,
  })
})

export const activateRider = asyncHandler(async (req, res) => {
  const data = await adminService.activateRider(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_RIDER_ACTIVATED,
    data,
  })
})

// ── 5. Order Management ──────────────────────────────────────────────────────

export const getOrders = asyncHandler(async (req, res) => {
  const data = await adminService.getOrders(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_ORDERS_FETCHED,
    data,
  })
})

export const getOrderById = asyncHandler(async (req, res) => {
  const data = await adminService.getOrderById(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_ORDER_FETCHED,
    data,
  })
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const data = await adminService.cancelOrder(req.params.id, req.body.reason)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_ORDER_CANCELLED,
    data,
  })
})

// ── 6. Review Moderation ─────────────────────────────────────────────────────

export const getReviews = asyncHandler(async (req, res) => {
  const data = await adminService.getReviews(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_REVIEWS_FETCHED,
    data,
  })
})

export const hideReview = asyncHandler(async (req, res) => {
  const data = await adminService.hideReview(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_REVIEW_HIDDEN,
    data,
  })
})

export const restoreReview = asyncHandler(async (req, res) => {
  const data = await adminService.restoreReview(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_REVIEW_RESTORED,
    data,
  })
})

// ── 7. Coupon Management ─────────────────────────────────────────────────────

export const getCoupons = asyncHandler(async (req, res) => {
  const data = await adminService.getCoupons(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_COUPONS_FETCHED,
    data,
  })
})

export const getCouponById = asyncHandler(async (req, res) => {
  const data = await adminService.getCouponById(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_COUPON_FETCHED,
    data,
  })
})

export const createCoupon = asyncHandler(async (req, res) => {
  const data = await adminService.createCoupon(req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: MSG.ADMIN_COUPON_CREATED,
    data,
  })
})

export const updateCoupon = asyncHandler(async (req, res) => {
  const data = await adminService.updateCoupon(req.params.id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_COUPON_UPDATED,
    data,
  })
})

export const deleteCoupon = asyncHandler(async (req, res) => {
  const data = await adminService.deleteCoupon(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_COUPON_DELETED,
    data,
  })
})

// ── 8. Category (Cuisine) Management ────────────────────────────────────────

export const getCuisines = asyncHandler(async (req, res) => {
  const data = await adminService.getCuisines()
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_CUISINES_FETCHED,
    data,
  })
})

export const createCuisine = asyncHandler(async (req, res) => {
  const data = await adminService.createCuisine(req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: MSG.ADMIN_CUISINE_CREATED,
    data,
  })
})

export const updateCuisine = asyncHandler(async (req, res) => {
  const data = await adminService.updateCuisine(req.params.id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_CUISINE_UPDATED,
    data,
  })
})

export const deleteCuisine = asyncHandler(async (req, res) => {
  const data = await adminService.deleteCuisine(req.params.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_CUISINE_DELETED,
    data,
  })
})

// ── 9. Analytics ─────────────────────────────────────────────────────────────

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_ANALYTICS_FETCHED,
    data,
  })
})

// ── 10. Notifications ────────────────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req, res) => {
  const data = await adminService.getNotifications(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_NOTIFICATIONS_FETCHED,
    data,
  })
})

export const broadcastNotification = asyncHandler(async (req, res) => {
  const data = await adminService.broadcastNotification(req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_NOTIFICATION_SENT,
    data,
  })
})

// ── 11. Platform Settings ────────────────────────────────────────────────────

export const getSettings = asyncHandler(async (req, res) => {
  const data = await adminService.getSettings()
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_SETTINGS_FETCHED,
    data,
  })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const data = await adminService.updateSettings(req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADMIN_SETTINGS_UPDATED,
    data,
  })
})

// ── 12. Audit Logs (Phase 13) ────────────────────────────────────────────────

export const getAuditLogs = asyncHandler(async (req, res) => {
  const data = await adminService.getAuditLogs(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.AUDIT_LOGS_FETCHED,
    data,
  })
})

