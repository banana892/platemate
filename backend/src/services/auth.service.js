/**
 * auth.service.js — Authentication Business Logic
 *
 * This is the heart of the auth system. It orchestrates:
 * - Repository (DB queries)
 * - Utilities (hashing, tokens, email)
 * - Error handling (ApiError)
 *
 * WHY ALL LOGIC HERE?
 * Controllers should be thin HTTP adapters. Services contain the business rules.
 * This means auth logic can be reused across REST, GraphQL, WebSocket, or CLI
 * without any coupling to Express.
 *
 * SECURITY PRINCIPLES:
 * 1. Never reveal whether an email exists (prevents user enumeration)
 * 2. Always hash tokens before storing (SHA-256 for lookup, bcrypt for passwords)
 * 3. Rotate refresh tokens on every use (prevents replay attacks)
 * 4. Revoke all sessions on password change/reset (forces re-auth)
 * 5. Tokens are single-use (verified via usedAt timestamp)
 */

import * as authRepo from '../repositories/auth.repository.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js'
import { generateRandomToken, hashToken } from '../utils/token.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../utils/email.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import logger from '../config/logger.js'

// ── Helper: Build token pair ─────────────────────────────────────────────────

/**
 * Generate an access + refresh token pair and store the refresh token in DB.
 * Used by login and refresh flows.
 *
 * @param {object} user - User record
 * @param {object} meta - { ip, userAgent }
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const issueTokenPair = async (user, meta = {}) => {
  // Access token — sent in Authorization header
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion || 0,
  })

  // Refresh token — stored in httpOnly cookie
  const rawRefreshToken = generateRandomToken()
  const hashedRefreshToken = hashToken(rawRefreshToken)

  // Store hashed version in DB
  await authRepo.createRefreshToken({
    userId: user.id,
    hashedToken: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo: meta.userAgent || null,
    ipAddress: meta.ip || null,
  })

  return { accessToken, refreshToken: rawRefreshToken }
}

// ── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user account
 * @param {object} data - { name, email, password, phone?, role? }
 * @returns {object} Created user (without password)
 */
export const register = async (data) => {
  const { name, email, password, phone, role } = data

  // Check for duplicate email
  const existingUser = await authRepo.findUserByEmail(email)
  if (existingUser) {
    throw new ApiError(HTTP.CONFLICT, MSG.EMAIL_ALREADY_EXISTS)
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user (isVerified defaults to false in schema)
  const user = await authRepo.createUser({
    name,
    email,
    password: hashedPassword,
    phone: phone || null,
    role: role || 'CUSTOMER',
  })

  // Generate email verification token
  const rawToken = generateRandomToken()
  const hashedVToken = hashToken(rawToken)

  await authRepo.createVerificationToken({
    userId: user.id,
    hashedToken: hashedVToken,
    type: 'EMAIL_VERIFY',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  })

  // Send verification email (non-blocking — don't await)
  sendVerificationEmail(email, name, rawToken).catch((err) => {
    logger.error({ err, userId: user.id }, 'Failed to send verification email')
  })

  return user
}

// ── Verify Email ─────────────────────────────────────────────────────────────

/**
 * Verify a user's email address using a one-time token
 * @param {string} token - Raw verification token from the email link
 * @returns {object} Updated user
 */
export const verifyEmail = async (token) => {
  const hashedVToken = hashToken(token)

  const verificationRecord = await authRepo.findVerificationToken(
    hashedVToken,
    'EMAIL_VERIFY'
  )

  if (!verificationRecord) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.INVALID_VERIFY_TOKEN)
  }

  // If already verified, return early with a helpful message
  if (verificationRecord.user.isVerified) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.EMAIL_ALREADY_VERIFIED)
  }

  // Mark token as used (prevents reuse)
  await authRepo.markVerificationTokenUsed(verificationRecord.id)

  // Activate the user account
  const user = await authRepo.updateUser(verificationRecord.userId, {
    isVerified: true,
  })

  return user
}

// ── Resend Verification ──────────────────────────────────────────────────────

/**
 * Resend the email verification link
 * Returns a generic success message regardless of whether the email exists
 * (prevents user enumeration)
 * @param {string} email
 */
export const resendVerification = async (email) => {
  const user = await authRepo.findUserByEmail(email)

  // Silent return to prevent user enumeration
  if (!user || user.isVerified || user.deletedAt) return

  // Invalidate any existing verification tokens
  await authRepo.invalidateUserTokensByType(user.id, 'EMAIL_VERIFY')

  // Generate new token
  const rawToken = generateRandomToken()
  const hashedVToken = hashToken(rawToken)

  await authRepo.createVerificationToken({
    userId: user.id,
    hashedToken: hashedVToken,
    type: 'EMAIL_VERIFY',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  })

  // Send email
  sendVerificationEmail(email, user.name, rawToken).catch((err) => {
    logger.error({ err, userId: user.id }, 'Failed to resend verification email')
  })
}

// ── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email and password
 * @param {string} email
 * @param {string} password
 * @param {object} meta - { ip, userAgent } for device tracking
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export const login = async (email, password, meta = {}) => {
  const user = await authRepo.findUserByEmail(email)

  // Use the same error for both "user not found" and "wrong password"
  // to prevent user enumeration
  if (!user || user.deletedAt) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_CREDENTIALS)
  }

  // Check if account is suspended
  if (!user.isActive) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.ACCOUNT_SUSPENDED)
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.EMAIL_NOT_VERIFIED)
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_CREDENTIALS)
  }

  // Issue token pair
  const { accessToken, refreshToken } = await issueTokenPair(user, meta)

  // Return user without password
  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  }
}

// ── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Rotate refresh token — issue new access + refresh token pair
 *
 * ROTATION SECURITY:
 * Every time a refresh token is used, the old one is revoked and a new one
 * is issued. If an attacker steals a refresh token and uses it first,
 * the legitimate user's next refresh will fail (token already revoked),
 * alerting them to the compromise.
 *
 * @param {string} rawRefreshToken - The raw refresh token from the cookie
 * @param {object} meta - { ip, userAgent }
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export const refresh = async (rawRefreshToken, meta = {}) => {
  if (!rawRefreshToken) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_INVALID)
  }

  const hashedToken = hashToken(rawRefreshToken)

  // Find the refresh token in DB (must be non-revoked and non-expired)
  const tokenRecord = await authRepo.findRefreshTokenByHash(hashedToken)

  if (!tokenRecord) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_INVALID)
  }

  const { user } = tokenRecord

  // Validate user state
  if (!user || user.deletedAt || !user.isActive) {
    // Revoke the token — user is gone or suspended
    await authRepo.revokeRefreshToken(tokenRecord.id)
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_INVALID)
  }

  // Revoke old refresh token (rotation)
  await authRepo.revokeRefreshToken(tokenRecord.id)

  // Issue new token pair
  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user, meta)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken: newRefreshToken,
  }
}

// ── Logout ───────────────────────────────────────────────────────────────────

/**
 * Revoke the current refresh token (single device logout)
 * @param {string} rawRefreshToken - The raw refresh token from the cookie
 */
export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return // Nothing to revoke

  const hashedToken = hashToken(rawRefreshToken)
  const tokenRecord = await authRepo.findRefreshTokenByHash(hashedToken)

  if (tokenRecord) {
    await authRepo.revokeRefreshToken(tokenRecord.id)
  }
}

// ── Logout All Devices ───────────────────────────────────────────────────────

/**
 * Revoke ALL refresh tokens for a user (all devices)
 * @param {string} userId
 */
export const logoutAll = async (userId) => {
  await authRepo.revokeAllUserRefreshTokens(userId)
  await authRepo.updateUser(userId, { tokenVersion: { increment: 1 } })
}

// ── Get Current User ─────────────────────────────────────────────────────────

/**
 * Fetch the current user's profile
 * @param {string} userId
 * @returns {object} User profile
 */
export const getMe = async (userId) => {
  const user = await authRepo.findUserById(userId)

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.USER_NOT_FOUND)
  }

  return user
}

// ── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Initiate password reset flow — generate token and send email.
 * Always returns success to prevent user enumeration.
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  const user = await authRepo.findUserByEmail(email)

  // Silent return — don't reveal whether the email exists
  if (!user || user.deletedAt) return

  // Invalidate any existing reset tokens for this user
  await authRepo.invalidateUserTokensByType(user.id, 'PASSWORD_RESET')

  // Generate reset token
  const rawToken = generateRandomToken()
  const hashedResetToken = hashToken(rawToken)

  await authRepo.createVerificationToken({
    userId: user.id,
    hashedToken: hashedResetToken,
    type: 'PASSWORD_RESET',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  })

  // Send reset email
  sendPasswordResetEmail(email, user.name, rawToken).catch((err) => {
    logger.error({ err, userId: user.id }, 'Failed to send password reset email')
  })
}

// ── Reset Password ───────────────────────────────────────────────────────────

/**
 * Reset password using a one-time token (from forgot-password email)
 * Also revokes all sessions to force re-authentication
 * @param {string} token - Raw reset token
 * @param {string} newPassword - The new password (already validated by Zod)
 */
export const resetPassword = async (token, newPassword) => {
  const hashedResetToken = hashToken(token)

  const tokenRecord = await authRepo.findVerificationToken(
    hashedResetToken,
    'PASSWORD_RESET'
  )

  if (!tokenRecord) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.INVALID_RESET_TOKEN)
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password and increment token version
  await authRepo.updateUser(tokenRecord.userId, {
    password: hashedPassword,
    tokenVersion: { increment: 1 },
  })

  // Mark reset token as used
  await authRepo.markVerificationTokenUsed(tokenRecord.id)

  // Revoke all refresh tokens — force re-login on all devices
  await authRepo.revokeAllUserRefreshTokens(tokenRecord.userId)

  // Send confirmation email
  sendPasswordChangedEmail(tokenRecord.user.email, tokenRecord.user.name).catch((err) => {
    logger.error({ err, userId: tokenRecord.userId }, 'Failed to send password changed email')
  })
}

// ── Change Password ──────────────────────────────────────────────────────────

/**
 * Change password for an authenticated user
 * Requires current password verification. Revokes all sessions.
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Fetch user with password for verification
  const user = await authRepo.findUserById(userId)

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.USER_NOT_FOUND)
  }

  // findUserById doesn't return password — we need a direct query
  const userWithPassword = await authRepo.findUserByEmail(user.email)

  // Verify current password
  const isCurrentValid = await comparePassword(currentPassword, userWithPassword.password)
  if (!isCurrentValid) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_CREDENTIALS)
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password and increment token version
  await authRepo.updateUser(userId, {
    password: hashedPassword,
    tokenVersion: { increment: 1 },
  })

  // Revoke all refresh tokens — force re-login everywhere
  await authRepo.revokeAllUserRefreshTokens(userId)

  // Send confirmation email
  sendPasswordChangedEmail(user.email, user.name).catch((err) => {
    logger.error({ err, userId }, 'Failed to send password changed email')
  })
}
