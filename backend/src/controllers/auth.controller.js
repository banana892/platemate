/**
 * auth.controller.js — Authentication Controller
 *
 * WHAT IS A CONTROLLER?
 * A controller is the HTTP layer. Its only job is:
 * 1. Extract data from req (body, params, query, cookies, headers)
 * 2. Call the service layer (business logic)
 * 3. Set cookies / headers if needed
 * 4. Send back the response
 *
 * A controller should NEVER contain business logic.
 * No DB queries. No password hashing. No token generation.
 * All of that belongs in the service.
 *
 * WHY THIS SEPARATION?
 * - Services can be tested without HTTP
 * - Controllers can be tested without DB
 * - Business logic is reusable across REST, GraphQL, sockets, CLI
 */

import * as authService from '../services/auth.service.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.js'
import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import asyncHandler from '../middleware/asyncHandler.js'

// ── Register ─────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body)

  res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, MSG.REGISTER_SUCCESS, user)
  )
})

// ── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.query.token)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.EMAIL_VERIFIED, user)
  )
})

// ── Resend Verification ──────────────────────────────────────────────────────

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email)

  // Always return success to prevent user enumeration
  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.RESEND_VERIFY_SUCCESS)
  )
})

// ── Login ────────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password,
    {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }
  )

  // Set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, refreshToken)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.LOGIN_SUCCESS, {
      user,
      accessToken,
    })
  )
})

// ── Refresh Token ────────────────────────────────────────────────────────────

export const refreshToken = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies.refreshToken

  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(
    rawRefreshToken,
    {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }
  )

  // Set new refresh token cookie (rotation)
  setRefreshTokenCookie(res, newRefreshToken)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.TOKEN_REFRESHED, {
      user,
      accessToken,
    })
  )
})

// ── Logout ───────────────────────────────────────────────────────────────────

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies.refreshToken

  await authService.logout(rawRefreshToken)

  // Clear the refresh token cookie
  clearRefreshTokenCookie(res)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.LOGOUT_SUCCESS)
  )
})

// ── Logout All Devices ───────────────────────────────────────────────────────

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id)

  // Clear the refresh token cookie for this device too
  clearRefreshTokenCookie(res)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.LOGOUT_ALL_SUCCESS)
  )
})

// ── Get Current User ─────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PROFILE_FETCHED, user)
  )
})

// ── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email)

  // Always return success to prevent user enumeration
  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PASSWORD_RESET_SENT)
  )
})

// ── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body

  await authService.resetPassword(token, password)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PASSWORD_RESET_SUCCESS)
  )
})

// ── Change Password ──────────────────────────────────────────────────────────

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  await authService.changePassword(req.user.id, currentPassword, newPassword)

  // Clear cookie — user must re-login
  clearRefreshTokenCookie(res)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PASSWORD_CHANGE_SUCCESS)
  )
})
