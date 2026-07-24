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
      req, // Thread req for requestId and audit logging
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

  await authService.logout(rawRefreshToken, { req })

  // Blacklist the active access token
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const crypto = await import('crypto')
      const jwt = await import('jsonwebtoken')
      const { blacklistToken } = await import('../redis/redis.service.js')
      const payload = jwt.default.decode(token)
      if (payload && payload.exp) {
        const remainingTime = payload.exp - Math.floor(Date.now() / 1000)
        if (remainingTime > 0) {
          const signature = token.split('.')[2] || token
          const tokenIdentifier = crypto.default.createHash('sha256').update(signature).digest('hex')
          await blacklistToken(tokenIdentifier, remainingTime)
        }
      }
    } catch (err) {}
  }

  // Clear the refresh token cookie
  clearRefreshTokenCookie(res)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.LOGOUT_SUCCESS)
  )
})

// ── Logout All Devices ───────────────────────────────────────────────────────

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id, { req })

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

  await authService.changePassword(req.user.id, currentPassword, newPassword, { req })

  // Clear cookie — user must re-login
  clearRefreshTokenCookie(res)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PASSWORD_CHANGE_SUCCESS)
  )
})

// ── Google OAuth Handlers ───────────────────────────────────────────────────

export const googleRedirect = asyncHandler(async (req, res) => {
  const { env } = await import('../config/env.js')
  const redirectUri = env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback'
  const clientId = env.GOOGLE_CLIENT_ID || ''
  const { role = 'CUSTOMER', intent = 'login' } = req.query

  const statePayload = Buffer.from(JSON.stringify({ role, intent })).toString('base64url')

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent('openid profile email')}&state=${encodeURIComponent(
    statePayload
  )}&prompt=select_account`

  res.redirect(googleAuthUrl)
})

export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query
  const { env } = await import('../config/env.js')
  const clientUrl = env.CLIENT_URL || 'http://localhost:5173'

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=Google authentication failed`)
  }

  let role = undefined
  let intent = 'login'

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
      if (decoded?.role) role = decoded.role
      if (decoded?.intent) intent = decoded.intent
    } catch (e) {
      // ignore invalid state
    }
  }

  try {
    const { user, accessToken, refreshToken } = await authService.loginWithGoogle(
      { code, role },
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        req,
      }
    )

    setRefreshTokenCookie(res, refreshToken)

    let targetPath = '/login'
    if (user.role === 'PARTNER' || user.role === 'RESTAURANT') {
      targetPath = '/signup/partner/complete'
    } else if (user.role === 'RIDER' || user.role === 'DELIVERY') {
      targetPath = '/signup/rider/complete'
    }

    res.redirect(`${clientUrl}${targetPath}?token=${accessToken}`)
  } catch (err) {
    const redirectPage = intent === 'signup' ? '/signup' : '/login'
    res.redirect(`${clientUrl}${redirectPage}?error=${encodeURIComponent(err.message || 'Google authentication failed')}`)
  }
})

export const googleVerify = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginWithGoogle(req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    req,
  })

  setRefreshTokenCookie(res, refreshToken)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.LOGIN_SUCCESS, {
      user,
      accessToken,
    })
  )
})


