/**
 * auth.controller.js — Authentication Controller Stubs
 *
 * WHAT IS A CONTROLLER?
 * A controller is the HTTP layer. Its only job is:
 * 1. Extract data from req (body, params, query, cookies)
 * 2. Call the service layer (business logic)
 * 3. Send back the response
 *
 * A controller should NEVER contain business logic.
 * No DB queries. No password hashing. No token generation.
 * All of that belongs in the service.
 *
 * WHY THIS SEPARATION?
 * - Services can be tested without HTTP
 * - Controllers can be tested without DB
 * - Business logic is reusable across REST, GraphQL, sockets, CLI
 *
 * PHASE 4 will implement the full logic.
 * These stubs allow the server to start and routes to be registered
 * without crashing on import.
 */

import { HTTP } from '../constants/httpStatus.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const register = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'register — implemented in Phase 4',
  })
})

export const login = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'login — implemented in Phase 4',
  })
})

export const logout = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'logout — implemented in Phase 4',
  })
})

export const refreshToken = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'refreshToken — implemented in Phase 4',
  })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'verifyEmail — implemented in Phase 4',
  })
})

export const resendVerification = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'resendVerification — implemented in Phase 4',
  })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'forgotPassword — implemented in Phase 4',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  res.status(HTTP.NOT_IMPLEMENTED).json({
    success: false,
    message: 'resetPassword — implemented in Phase 4',
  })
})

export const getMe = asyncHandler(async (req, res) => {
  // This one we can implement now — req.user is already populated by authenticate
  res.status(HTTP.OK).json({
    success: true,
    message: 'Current user',
    data: req.user,
  })
})
