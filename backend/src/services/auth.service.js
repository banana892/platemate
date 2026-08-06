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
import { env } from '../config/env.js'
import * as securityService from '../security/security.service.js'
import * as auditService from '../security/audit.service.js'
import * as passwordService from '../security/password.service.js'

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

  const requireVerification = env.REQUIRE_EMAIL_VERIFICATION === true

  // Create user (if verification is NOT required, auto-verify user)
  const user = await authRepo.createUser({
    name,
    email,
    password: hashedPassword,
    phone: phone || null,
    role: role || 'CUSTOMER',
    isVerified: !requireVerification,
  })

  // Generate and send verification email if required
  if (requireVerification) {
    const rawToken = generateRandomToken()
    const hashedVToken = hashToken(rawToken)

    await authRepo.createVerificationToken({
      userId: user.id,
      hashedToken: hashedVToken,
      type: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    sendVerificationEmail(email, name, rawToken).catch((err) => {
      logger.error({ err, userId: user.id }, 'Failed to send verification email')
    })
  }

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
 * @param {object} meta - { ip, userAgent, req } for device tracking and audit logging
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export const login = async (email, password, meta = {}) => {
  const { req } = meta

  // ── 1. Check login lockout BEFORE any DB work ────────────────────────────
  // Prevents brute-force even before we hit the database.
  const lockout = await securityService.checkLoginLockout(email)
  if (lockout.locked) {
    // Log lockout check (account is already locked — not a new lockout)
    auditService.logAuditEvent({
      requestId: req?.id,
      action: 'ACCOUNT_LOCKED',
      ip: meta.ip,
      userAgent: meta.userAgent,
      meta: { email, reason: 'Login blocked: account locked', remainingSeconds: lockout.remainingSeconds },
    })
    throw new ApiError(HTTP.TOO_MANY_REQUESTS, MSG.ACCOUNT_LOCKED)
  }

  const user = await authRepo.findUserByEmail(email)

  // Use the same error for both "user not found" and "wrong password"
  // to prevent user enumeration
  if (!user || user.deletedAt) {
    // Record failure even for non-existent emails (prevents enumeration via timing)
    await securityService.recordLoginFailure(email)
    auditService.logAuditEvent({
      requestId: req?.id,
      action: 'LOGIN_FAILURE',
      ip: meta.ip,
      userAgent: meta.userAgent,
      meta: { email, reason: 'User not found' },
    })
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
    // Record failure and check if this just triggered a lock
    const { justLocked } = await securityService.recordLoginFailure(email)

    if (justLocked) {
      auditService.logAuditEvent({
        requestId: req?.id,
        userId: user.id,
        action: 'ACCOUNT_LOCKED',
        ip: meta.ip,
        userAgent: meta.userAgent,
        meta: { email, reason: 'Max login failures reached' },
      })
    } else {
      auditService.logAuditEvent({
        requestId: req?.id,
        userId: user.id,
        action: 'LOGIN_FAILURE',
        ip: meta.ip,
        userAgent: meta.userAgent,
        meta: { email, reason: 'Invalid password' },
      })
    }

    throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_CREDENTIALS)
  }

  // ── Successful login ─────────────────────────────────────────────────────
  // Clear the failure counter so the next lockout window starts fresh.
  await securityService.clearLoginAttempts(email)

  // Audit successful login
  auditService.logAuditEvent({
    requestId: req?.id,
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { email },
  })

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
 * @param {object} [meta] - { req } for audit logging
 */
export const logout = async (rawRefreshToken, meta = {}) => {
  if (!rawRefreshToken) return // Nothing to revoke

  const hashedToken = hashToken(rawRefreshToken)
  const tokenRecord = await authRepo.findRefreshTokenByHash(hashedToken)

  if (tokenRecord) {
    await authRepo.revokeRefreshToken(tokenRecord.id)

    // Audit token revocation
    auditService.logAuditEvent({
      requestId: meta.req?.id,
      userId: tokenRecord.userId,
      action: 'LOGOUT',
      ip: meta.req?.ip,
      userAgent: meta.req?.headers?.['user-agent'],
    })
  }
}

// ── Logout All Devices ───────────────────────────────────────────────────────

/**
 * Revoke ALL refresh tokens for a user (all devices)
 * @param {string} userId
 * @param {object} [meta] - { req } for audit logging
 */
export const logoutAll = async (userId, meta = {}) => {
  await authRepo.revokeAllUserRefreshTokens(userId)
  await authRepo.updateUser(userId, { tokenVersion: { increment: 1 } })

  // Audit token revocation for all sessions
  auditService.logAuditEvent({
    requestId: meta.req?.id,
    userId,
    action: 'TOKEN_REVOKED',
    ip: meta.req?.ip,
    userAgent: meta.req?.headers?.['user-agent'],
    meta: { reason: 'Logout all devices' },
  })
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
 * Requires current password verification. Checks password history. Revokes all sessions.
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {object} [meta] - { req } for audit logging
 */
export const changePassword = async (userId, currentPassword, newPassword, meta = {}) => {
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

  // Check password history (prevent reuse of last N passwords)
  const isReused = await passwordService.isPasswordReused(userId, newPassword)
  if (isReused) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `You cannot reuse any of your last ${5} passwords. Please choose a different password.`
    )
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password and increment token version
  await authRepo.updateUser(userId, {
    password: hashedPassword,
    tokenVersion: { increment: 1 },
  })

  // Save to password history (fire-and-forget, non-blocking)
  passwordService.savePasswordHistory(userId, hashedPassword)

  // Revoke all refresh tokens — force re-login everywhere
  await authRepo.revokeAllUserRefreshTokens(userId)

  // Audit password change
  auditService.logAuditEvent({
    requestId: meta.req?.id,
    userId,
    action: 'PASSWORD_CHANGED',
    ip: meta.req?.ip,
    userAgent: meta.req?.headers?.['user-agent'],
  })

  // Send confirmation email
  sendPasswordChangedEmail(user.email, user.name).catch((err) => {
    logger.error({ err, userId }, 'Failed to send password changed email')
  })
}

// ── Google Login ─────────────────────────────────────────────────────────────

/**
 * Authenticate or register a user via Google OAuth (ID token or Authorization code)
 * @param {object} payload - { idToken, credential, code }
 * @param {object} meta - { ip, userAgent, req }
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export const loginWithGoogle = async (payload, meta = {}) => {
  const { idToken, credential, code, role: requestedRole } = payload
  const tokenToVerify = idToken || credential

  let googleUser = null

  if (tokenToVerify) {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`
      )
      if (!response.ok) {
        throw new Error('Invalid Google token response')
      }
      const data = await response.json()
      if (!data.email) {
        throw new Error('No email found in Google token')
      }
      googleUser = {
        email: data.email,
        name: data.name || data.email.split('@')[0],
        picture: data.picture || null,
        email_verified: data.email_verified === true || data.email_verified === 'true',
      }
    } catch (err) {
      logger.error({ err }, 'Google ID Token verification failed')
      throw new ApiError(HTTP.UNAUTHORIZED, 'Failed to verify Google token with Google servers.')
    }
  } else if (code) {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const params = new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      })

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const tokenData = await res.json()
      if (!tokenData.id_token) {
        throw new Error(tokenData.error_description || 'Failed to exchange authorization code')
      }

      const infoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`
      )
      const info = await infoRes.json()
      googleUser = {
        email: info.email,
        name: info.name || info.email.split('@')[0],
        picture: info.picture || null,
        email_verified: info.email_verified === true || info.email_verified === 'true',
      }
    } catch (err) {
      logger.error({ err }, 'Google OAuth code exchange failed')
      throw new ApiError(HTTP.UNAUTHORIZED, 'Failed to authenticate code with Google.')
    }
  } else {
    throw new ApiError(HTTP.BAD_REQUEST, 'Missing Google credential or code.')
  }

  const { email, name, picture } = googleUser

  // Normalize requested role if provided
  let targetRole = 'CUSTOMER'
  if (requestedRole) {
    const uppercaseRole = requestedRole.toUpperCase()
    if (uppercaseRole === 'RESTAURANT' || uppercaseRole === 'PARTNER') {
      targetRole = 'PARTNER'
    } else if (uppercaseRole === 'DELIVERY' || uppercaseRole === 'RIDER') {
      targetRole = 'RIDER'
    } else if (uppercaseRole === 'CUSTOMER') {
      targetRole = 'CUSTOMER'
    }
  }

  let user = await authRepo.findUserByEmail(email)

  if (user) {
    if (user.deletedAt) {
      throw new ApiError(HTTP.UNAUTHORIZED, MSG.INVALID_CREDENTIALS)
    }
    if (!user.isActive) {
      throw new ApiError(HTTP.FORBIDDEN, MSG.ACCOUNT_SUSPENDED)
    }
    // If a specific role was requested during registration, check for role conflict
    if (requestedRole && user.role !== targetRole) {
      throw new ApiError(
        HTTP.CONFLICT,
        `Google account already registered as ${user.role}. Cannot register again as ${targetRole} using the same email.`
      )
    }
    if (!user.isVerified || (picture && !user.avatar)) {
      user = await authRepo.updateUser(user.id, {
        isVerified: true,
        ...(picture && !user.avatar ? { avatar: picture } : {}),
      })
    }
  } else {
    const dummyPassword = await hashPassword(generateRandomToken())
    user = await authRepo.createUser({
      name,
      email,
      password: dummyPassword,
      avatar: picture,
      role: targetRole,
    })
    user = await authRepo.updateUser(user.id, { isVerified: true })
  }


  auditService.logAuditEvent({
    requestId: meta.req?.id,
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { email, provider: 'google' },
  })

  const { accessToken, refreshToken } = await issueTokenPair(user, meta)
  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  }
}

