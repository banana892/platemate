/**
 * bcrypt.js — Password Hashing Utilities
 *
 * WHY BCRYPT?
 * bcrypt is a key derivation function designed specifically for passwords.
 * Unlike SHA256 (which is fast — bad for passwords), bcrypt is intentionally
 * slow. The "rounds" (cost factor) controls how long it takes.
 *
 * BCRYPT_ROUNDS=12 means 2^12 = 4096 iterations. On modern hardware:
 * - Hashing takes ~300ms (imperceptible to users)
 * - An attacker with a GPU can only try ~thousands/sec instead of billions/sec
 *
 * Never store plain passwords. Never use MD5/SHA for passwords.
 * bcrypt, scrypt, or Argon2 are the only acceptable choices.
 *
 * WHY SEPARATE FROM AUTH SERVICE?
 * Keeping hashing logic in a utility means you can swap bcrypt for Argon2
 * in the future without touching the auth service. Separation of concerns.
 */

import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'

/**
 * Hash a plain-text password
 * @param {string} password - The raw password from the user
 * @returns {Promise<string>} - The bcrypt hash
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS)
}

/**
 * Compare a plain-text password against a stored hash
 * @param {string} password - Raw password from login form
 * @param {string} hash     - Stored bcrypt hash from database
 * @returns {Promise<boolean>}
 *
 * WHY NOT DO THIS MANUALLY?
 * bcrypt.compare is timing-safe (constant time). A naive string comparison
 * would be vulnerable to timing attacks — attackers can measure how long
 * the comparison takes to guess characters one by one.
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}
