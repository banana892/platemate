/**
 * auth.js — JWT Authentication Middleware
 *
 * This middleware protects routes that require authentication.
 * It extracts the access token from the Authorization header,
 * verifies it, looks up the user in the DB, and attaches it to req.user.
 *
 * WHY CHECK THE DB?
 * The JWT alone proves the token is valid, but what if:
 * - The user's account was banned?
 * - The user was deleted?
 * - An admin revoked all sessions?
 *
 * We make one lightweight DB query to get the user's current state.
 * To avoid this on every request (performance concern), in Phase 11
 * we'll add Redis caching: check Redis first, fall back to DB.
 *
 * TOKEN EXTRACTION:
 * We read from the Authorization header: "Bearer <token>"
 * NOT from cookies — the access token is stored in memory (Redux state)
 * on the frontend. Only the refresh token lives in an httpOnly cookie.
 *
 * USAGE:
 *   import { authenticate } from '../middleware/auth.js'
 *   router.get('/profile', authenticate, userController.getProfile)
 */

import { verifyAccessToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import prisma from '../config/db.js'
import asyncHandler from './asyncHandler.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  // ── 1. Extract token from Authorization header ──────────────────────────
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, MSG.UNAUTHORIZED)
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    throw new ApiError(401, MSG.UNAUTHORIZED)
  }

  // ── 2. Verify the token ────────────────────────────────────────────────
  // verifyAccessToken throws ApiError if invalid/expired
  const payload = verifyAccessToken(token)

  // ── 3. Look up the user in the database ───────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true,
      tokenVersion: true,
      deletedAt: true,
    },
  })

  // ── 4. Validate user state ─────────────────────────────────────────────
  if (!user || user.deletedAt) {
    throw new ApiError(401, MSG.UNAUTHORIZED)
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.')
  }

  // Verify token version matches user's current version
  if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, MSG.TOKEN_EXPIRED)
  }

  // ── 5. Attach user to request object ──────────────────────────────────
  // Available as req.user in all subsequent middleware and controllers
  req.user = user

  next()
})

/**
 * Optional authentication — does not throw if no token is present.
 * Useful for public routes that show different content for logged-in users.
 * e.g., restaurant listing (public) vs with "favorited" state (logged in)
 */
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next() // Continue without user
  }

  try {
    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, tokenVersion: true },
    })

    if (user && (payload.tokenVersion === undefined || user.tokenVersion === payload.tokenVersion)) {
      req.user = user
    }
  } catch {
    // Silent fail — treat as unauthenticated
  }

  next()
})
