/**
 * restaurant.controller.js — Restaurant Controller Stubs
 * Full implementation in Phase 5.
 */

import { HTTP } from '../constants/httpStatus.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const listRestaurants = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'listRestaurants — Phase 5' })
})

export const getFeatured = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'getFeatured — Phase 5' })
})

export const searchRestaurants = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'searchRestaurants — Phase 5' })
})

export const getRestaurant = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'getRestaurant — Phase 5' })
})

export const getMenu = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'getMenu — Phase 5' })
})

export const getReviews = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'getReviews — Phase 5' })
})
