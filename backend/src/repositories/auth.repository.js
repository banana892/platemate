/**
 * auth.repository.js — Authentication Data Access Layer
 *
 * WHY A REPOSITORY?
 * The repository pattern isolates ALL database queries behind a clean API.
 * This means:
 * - Services never import Prisma directly
 * - Database logic is testable in isolation (mock the repository)
 * - If you switch from Prisma to Drizzle or raw SQL, only this file changes
 * - Queries are reusable across services
 *
 * NAMING CONVENTION:
 * find* = read operations (return null if not found, never throw)
 * create* = insert operations
 * update* = update operations
 * revoke* = soft-delete / invalidation operations
 */

import prisma from '../config/db.js'

// ── User Operations ─────────────────────────────────────────────────────────

/**
 * Find a user by email (includes password for auth verification)
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      password: true,
      avatar: true,
      role: true,
      isVerified: true,
      isActive: true,
      tokenVersion: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Find a user by ID (excludes password — for profile/me endpoints)
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isVerified: true,
      isActive: true,
      tokenVersion: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Create a new user
 * @param {object} data - { name, email, password, phone?, role? }
 * @returns {Promise<object>}
 */
export const createUser = async (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      tokenVersion: true,
      createdAt: true,
    },
  })
}

/**
 * Update a user by ID
 * @param {string} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
export const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      isActive: true,
      tokenVersion: true,
    },
  })
}

// ── Refresh Token Operations ─────────────────────────────────────────────────

/**
 * Store a hashed refresh token in the database
 * @param {object} data - { userId, hashedToken, expiresAt, deviceInfo?, ipAddress? }
 * @returns {Promise<object>}
 */
export const createRefreshToken = async (data) => {
  return prisma.refreshToken.create({ data })
}

/**
 * Find an active (non-revoked, non-expired) refresh token by its hash
 * @param {string} hashedToken
 * @returns {Promise<object|null>}
 */
export const findRefreshTokenByHash = async (hashedToken) => {
  return prisma.refreshToken.findFirst({
    where: {
      hashedToken,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          isActive: true,
          tokenVersion: true,
          deletedAt: true,
        },
      },
    },
  })
}

/**
 * Revoke a specific refresh token (on logout or rotation)
 * @param {string} id - RefreshToken record ID
 * @returns {Promise<object>}
 */
export const revokeRefreshToken = async (id) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  })
}

/**
 * Revoke ALL refresh tokens for a user (logout-all, password change/reset)
 * @param {string} userId
 * @returns {Promise<{count: number}>}
 */
export const revokeAllUserRefreshTokens = async (userId) => {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  })
}

// ── Verification Token Operations ────────────────────────────────────────────

/**
 * Create a verification token (email verify or password reset)
 * @param {object} data - { userId, hashedToken, type, expiresAt }
 * @returns {Promise<object>}
 */
export const createVerificationToken = async (data) => {
  return prisma.verificationToken.create({ data })
}

/**
 * Find a valid (unused, non-expired) verification token by hash and type
 * @param {string} hashedToken
 * @param {string} type - 'EMAIL_VERIFY' or 'PASSWORD_RESET'
 * @returns {Promise<object|null>}
 */
export const findVerificationToken = async (hashedToken, type) => {
  return prisma.verificationToken.findFirst({
    where: {
      hashedToken,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          isActive: true,
          tokenVersion: true,
        },
      },
    },
  })
}

/**
 * Mark a verification token as used
 * @param {string} id - VerificationToken record ID
 * @returns {Promise<object>}
 */
export const markVerificationTokenUsed = async (id) => {
  return prisma.verificationToken.update({
    where: { id },
    data: { usedAt: new Date() },
  })
}

/**
 * Invalidate all unused verification tokens of a type for a user
 * (e.g., when resending verification or after successful password reset)
 * @param {string} userId
 * @param {string} type - 'EMAIL_VERIFY' or 'PASSWORD_RESET'
 * @returns {Promise<{count: number}>}
 */
export const invalidateUserTokensByType = async (userId, type) => {
  return prisma.verificationToken.updateMany({
    where: {
      userId,
      type,
      usedAt: null,
    },
    data: { usedAt: new Date() },
  })
}
