/**
 * authorize.js — Role-Based Access Control Middleware
 *
 * RBAC (Role-Based Access Control) answers the question:
 * "Can this authenticated user perform this action?"
 *
 * authenticate answers: "Who are you?" (identity)
 * authorize answers:    "What can you do?" (permission)
 *
 * Always use authenticate BEFORE authorize:
 *   router.patch('/admin/users/:id', authenticate, authorize('ADMIN'), handler)
 *
 * WHY FACTORY PATTERN?
 * authorize('ADMIN', 'PARTNER') returns a middleware function.
 * This lets you pass multiple allowed roles cleanly.
 *
 * USAGE:
 *   import { authorize } from '../middleware/authorize.js'
 *   import { ROLES } from '../constants/roles.js'
 *
 *   // Only admins
 *   router.get('/admin', authenticate, authorize(ROLES.ADMIN), adminController.dashboard)
 *
 *   // Partners and admins
 *   router.get('/restaurant/dashboard', authenticate, authorize(ROLES.PARTNER, ROLES.ADMIN), handler)
 *
 *   // Any authenticated user (just needs to be logged in)
 *   router.get('/profile', authenticate, handler)
 */

import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'

/**
 * Role-based authorization middleware factory
 * @param {...string} roles - Allowed roles (e.g., 'ADMIN', 'PARTNER')
 * @returns Express middleware
 */
export const authorize = (...roles) => (req, res, next) => {
  // Must be called after authenticate — req.user must be set
  if (!req.user) {
    return next(new ApiError(401, MSG.UNAUTHORIZED))
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, MSG.FORBIDDEN))
  }

  next()
}

/**
 * Ownership guard — ensures the authenticated user owns the resource
 * Use this for cases like "user can only edit their own profile"
 *
 * USAGE:
 *   router.patch('/addresses/:id', authenticate, ownOrAdmin('userId'), handler)
 *
 * @param {string} paramKey - The request param that holds the owner ID
 *                            OR pass a function: (req) => req.resource.userId
 */
export const ownOrAdmin = (getOwnerId) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, MSG.UNAUTHORIZED))
  }

  // Admin can access anything
  if (req.user.role === 'ADMIN') return next()

  // Determine the owner ID
  const ownerId =
    typeof getOwnerId === 'function' ? getOwnerId(req) : req.params[getOwnerId]

  if (req.user.id !== ownerId) {
    return next(new ApiError(403, MSG.FORBIDDEN))
  }

  next()
}
