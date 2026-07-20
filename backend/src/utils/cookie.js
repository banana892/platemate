/**
 * cookie.js — Refresh Token Cookie Utilities
 *
 * WHY SEPARATE FROM JWT.JS?
 * jwt.js handles token creation/verification (crypto concerns).
 * cookie.js handles HTTP cookie management (transport concerns).
 * Separation of concerns = easier to maintain and test.
 *
 * COOKIE SECURITY:
 * - httpOnly: JavaScript cannot read the cookie (XSS protection)
 * - secure: Cookie only sent over HTTPS (disabled in dev for localhost)
 * - sameSite: CSRF protection
 *   - 'strict' in production: cookie never sent cross-origin
 *   - 'lax' in development: allows cookie on same-site navigation
 * - path: Cookie only sent to /api/v1/auth routes (minimizes exposure)
 */

import { env } from '../config/env.js'

const isProd = env.NODE_ENV === 'production'

/**
 * Cookie options for setting the refresh token
 */
export const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/api/v1/auth',
})

/**
 * Cookie options for clearing the refresh token (on logout)
 * maxAge is omitted — the browser removes the cookie immediately
 */
export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/api/v1/auth',
})

/**
 * Set the refresh token as an httpOnly cookie on the response
 * @param {import('express').Response} res - Express response object
 * @param {string} token - Raw refresh token
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, getRefreshTokenCookieOptions())
}

/**
 * Clear the refresh token cookie (used on logout)
 * @param {import('express').Response} res - Express response object
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', getClearCookieOptions())
}
