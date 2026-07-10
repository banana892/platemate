/**
 * user.controller.js — User Profile Controller Stubs
 * Full implementation in Phase 5.
 */

import { HTTP } from '../constants/httpStatus.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const getProfile = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'getProfile — Phase 5' })
})

export const updateProfile = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'updateProfile — Phase 5' })
})

export const changePassword = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'changePassword — Phase 5' })
})

export const deleteAccount = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({ success: false, message: 'deleteAccount — Phase 5' })
})
