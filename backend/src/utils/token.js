/**
 * token.js — Cryptographic Token Utilities
 *
 * WHY NOT BCRYPT FOR TOKEN HASHING?
 * Bcrypt is intentionally slow (300ms) — great for passwords where you verify
 * one at a time. For verification/reset tokens, we need to LOOK UP by hash
 * in the database. SHA-256 is deterministic and fast, which is fine because:
 * - Tokens are 32 bytes of cryptographic randomness (256 bits of entropy)
 * - They're single-use and expire quickly
 * - The hash is only used for lookup, not brute-force resistance
 *
 * For refresh tokens stored in DB, we also use SHA-256 because we need
 * to look them up by hash value on every refresh request.
 */

import crypto from 'crypto'

/**
 * Generate a cryptographically secure random token
 * 32 bytes = 64 hex characters = 256 bits of entropy
 * @returns {string} Random hex token
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token using SHA-256 for secure storage
 * @param {string} token - The raw token to hash
 * @returns {string} SHA-256 hex digest
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}
