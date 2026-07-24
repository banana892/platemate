/**
 * rider.controller.js — HTTP Handler Layer for Delivery Partner (Phase 7)
 *
 * Controllers are intentionally thin:
 *   1. Extract validated data from req
 *   2. Call the service function
 *   3. Send a structured JSON response
 *
 * No business logic here. All rules live in rider.service.js.
 * All Prisma calls live in rider.repository.js.
 */

import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as riderService from '../services/rider.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await riderService.getDashboard(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_DASHBOARD_FETCHED,
    data,
  })
})

// ── Profile ────────────────────────────────────────────────────────────────────

export const getProfile = asyncHandler(async (req, res) => {
  const data = await riderService.getProfile(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_PROFILE_FETCHED,
    data,
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await riderService.updateProfile(req.user.id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_PROFILE_UPDATED,
    data,
  })
})

// ── Availability Status ────────────────────────────────────────────────────────

export const getRiderStatus = asyncHandler(async (req, res) => {
  const data = await riderService.getRiderStatus(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_STATUS_FETCHED,
    data,
  })
})

export const updateRiderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const data = await riderService.updateRiderStatus(req.user.id, status)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_STATUS_UPDATED,
    data,
  })
})

// ── Active Deliveries ──────────────────────────────────────────────────────────

export const getActiveOrders = asyncHandler(async (req, res) => {
  const data = await riderService.getActiveOrders(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_ORDERS_FETCHED,
    data,
  })
})

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = await riderService.getOrderById(req.user.id, id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_ORDER_FETCHED,
    data,
  })
})

// ── Delivery Status ────────────────────────────────────────────────────────────

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const data = await riderService.updateDeliveryStatus(req.user.id, id, status)
  res.status(HTTP.OK).json({
    success: true,
    message: `${MSG.RIDER_STATUS_UPDATE_SUCCESS} New status: ${status}`,
    data,
  })
})

// ── Delivery History ───────────────────────────────────────────────────────────

export const getDeliveryHistory = asyncHandler(async (req, res) => {
  const data = await riderService.getDeliveryHistory(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_HISTORY_FETCHED,
    data,
  })
})

// ── Earnings ───────────────────────────────────────────────────────────────────

export const getEarnings = asyncHandler(async (req, res) => {
  const data = await riderService.getEarnings(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_EARNINGS_FETCHED,
    data,
  })
})

// ── Analytics ─────────────────────────────────────────────────────────────────

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await riderService.getAnalytics(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_ANALYTICS_FETCHED,
    data,
  })
})

// ── Notifications ──────────────────────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req, res) => {
  const data = await riderService.getNotifications(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_NOTIFICATIONS_FETCHED,
    data,
  })
})

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params
  await riderService.markNotificationRead(req.user.id, id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_NOTIFICATION_READ,
    data: { id },
  })
})

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await riderService.markAllNotificationsRead(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.RIDER_ALL_NOTIFICATIONS_READ,
    data: result,
  })
})
