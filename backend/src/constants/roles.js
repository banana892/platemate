/**
 * roles.js — User Role Constants
 *
 * These mirror the Role enum in Prisma schema exactly.
 * Having them here in JS means the frontend (if ever importing from backend)
 * and the backend share the same source of truth for role names.
 *
 * RBAC Design:
 * CUSTOMER  — Can browse, order, review, manage their own profile
 * PARTNER   — Can manage their restaurant(s), menu, and view their orders
 * RIDER     — Can accept deliveries, update delivery status, view earnings
 * ADMIN     — Full access to the entire platform
 */

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  PARTNER: 'PARTNER',
  RIDER: 'RIDER',
  ADMIN: 'ADMIN',
}

// Convenience arrays for role checks
export const ALL_ROLES = Object.values(ROLES)
export const STAFF_ROLES = [ROLES.PARTNER, ROLES.RIDER, ROLES.ADMIN]
export const MANAGEMENT_ROLES = [ROLES.PARTNER, ROLES.ADMIN]
