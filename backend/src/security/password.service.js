/**
 * password.service.js — Password Security Utilities (Phase 13)
 *
 * WHY SEPARATE FROM bcrypt.js?
 * bcrypt.js is a pure hashing utility — it has no concept of policy or history.
 * This service owns password POLICY: strength rules, reuse prevention, and
 * future breach detection. Keeping them separate preserves the single-responsibility
 * principle and lets us swap bcrypt without touching policy logic.
 *
 * PASSWORD HISTORY (Anti-Reuse):
 * We store bcrypt hashes (never plaintext) of the last N passwords.
 * On password change, we compare the candidate against each stored hash
 * using bcrypt.compare() — a slow, constant-time comparison that prevents
 * brute-forcing stored hashes.
 *
 * The history table is pruned to historyDepth entries after every save,
 * keeping the table bounded and queries fast.
 */

import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import logger from '../config/logger.js'
import { SECURITY_CONFIG } from './security.config.js'

const { password: policy } = SECURITY_CONFIG

// ── Password Strength Validation ──────────────────────────────────────────────

/**
 * Validate a password against the configured policy.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 *
 * We deliberately return all violations at once (not fail-fast) so the
 * client can show a complete checklist to the user.
 *
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validatePasswordStrength = (password) => {
  const errors = []

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] }
  }

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters.`)
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.')
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.')
  }

  if (policy.requireDigit && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit.')
  }

  if (policy.requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character.')
  }

  return { valid: errors.length === 0, errors }
}

// ── Password History (Anti-Reuse) ─────────────────────────────────────────────

/**
 * Check whether the candidate password matches any of the user's last N passwords.
 *
 * Uses bcrypt.compare() — slow by design to prevent brute-forcing stored hashes.
 * Fails open (returns false = not reused) if DB query fails, to prevent lockout.
 *
 * @param {string} userId
 * @param {string} plaintextPassword - The new password candidate (unhashed)
 * @returns {Promise<boolean>} true if the password has been used before
 */
export const isPasswordReused = async (userId, plaintextPassword) => {
  try {
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: policy.historyDepth,
      select: { hash: true },
    })

    // Compare candidate against each stored hash
    for (const { hash } of history) {
      const matches = await bcrypt.compare(plaintextPassword, hash)
      if (matches) return true
    }

    return false
  } catch (err) {
    logger.error({ err: err.message, userId }, 'Password history check failed — allowing (fail-open)')
    return false // Fail-open: don't lock users out if history check breaks
  }
}

/**
 * Save a new password hash to the history table, then prune to historyDepth.
 *
 * This must be called AFTER successfully updating the user's password,
 * never before (to avoid recording a rejected password).
 *
 * @param {string} userId
 * @param {string} hashedPassword - Already bcrypt-hashed password to store
 */
export const savePasswordHistory = async (userId, hashedPassword) => {
  try {
    // Insert the new hash
    await prisma.passwordHistory.create({
      data: {
        userId,
        hash: hashedPassword,
      },
    })

    // Prune: keep only the most recent historyDepth entries
    const entries = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    if (entries.length > policy.historyDepth) {
      const idsToDelete = entries.slice(policy.historyDepth).map((e) => e.id)
      await prisma.passwordHistory.deleteMany({
        where: { id: { in: idsToDelete } },
      })
    }
  } catch (err) {
    logger.error({ err: err.message, userId }, 'Failed to save password history')
    // Non-critical: history save failure doesn't break the password change
  }
}

// ── Breach Detection (Stub) ───────────────────────────────────────────────────

/**
 * Check if a password has appeared in known data breaches.
 *
 * STUB: Always returns false.
 * Future implementation: k-anonymity HIBP API (SHA-1 prefix lookup).
 * https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
 *
 * @param {string} _password
 * @returns {Promise<boolean>} true if password is known to be compromised
 */
export const isPasswordCompromised = async (_password) => {
  return false
}
