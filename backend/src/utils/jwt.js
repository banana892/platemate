/**
 * jwt.js — JWT Token Utilities
 *
 * WHY TWO TOKENS?
 * Access Token (15 min): Short-lived. Sent with every API request.
 *   If stolen, the attacker has at most 15 minutes of access.
 *
 * Refresh Token (7 days): Long-lived. Stored in httpOnly cookie.
 *   Used ONLY to get a new access token. Never sent to your APIs.
 *   httpOnly means JavaScript cannot read it — XSS attacks can't steal it.
 *
 * This is the OAuth 2.0 spec's recommended approach.
 *
 * REFRESH TOKEN ROTATION:
 * Every time a refresh token is used, we:
 *   1. Validate the old refresh token against the DB
 *   2. Issue a new access + refresh token pair
 *   3. Invalidate the old refresh token in the DB
 *
 * If an attacker steals a refresh token and uses it, the legitimate user's
 * next request will fail (because their token was rotated away), alerting
 * them to the breach.
 */

import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from './ApiError.js'
import { MSG } from '../constants/messages.js'

// ── Token Generation ──────────────────────────────────────────────────────────

/**
 * Generate a short-lived access token (15m default)
 * Payload: { userId, email, role }
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
    issuer: 'platemate',
    audience: 'platemate-client',
  })
}

/**
 * Generate a long-lived refresh token (7d default)
 * Payload: { userId, tokenVersion }
 * tokenVersion allows invalidating all tokens for a user (e.g., after password change)
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
    issuer: 'platemate',
    audience: 'platemate-client',
  })
}

/**
 * Generate a short-lived token for email verification / password reset
 * These use the access secret since they're one-time-use
 */
export const generateEmailToken = (payload, expiresIn = env.EMAIL_VERIFY_EXPIRES) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn })
}

// ── Token Verification ────────────────────────────────────────────────────────

/**
 * Verify an access token — throws ApiError on failure
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'platemate',
      audience: 'platemate-client',
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized(MSG.TOKEN_EXPIRED)
    }
    throw ApiError.unauthorized(MSG.TOKEN_INVALID)
  }
}

/**
 * Verify a refresh token — throws ApiError on failure
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'platemate',
      audience: 'platemate-client',
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized(MSG.TOKEN_EXPIRED)
    }
    throw ApiError.unauthorized(MSG.TOKEN_INVALID)
  }
}

/**
 * Verify an email/password-reset token
 */
export const verifyEmailToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'platemate',
    })
  } catch (err) {
    throw ApiError.unauthorized('This link has expired or is invalid.')
  }
}

