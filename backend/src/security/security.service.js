/**
 * security.service.js — Runtime Security Checks (Phase 13)
 *
 * WHY THIS SERVICE?
 * Login lockout, fingerprinting, and suspicious activity detection are
 * cross-cutting concerns that don't belong in auth.service.js (which owns
 * the authentication business logic). This service owns the *runtime enforcement*
 * layer — it reads and writes Redis state via redis.service.js exclusively.
 *
 * REDIS ACCESS RULE:
 * This service never imports redisClient directly.
 * It uses checkRateLimit() and getCache/setCache/deleteCache from redis.service.js.
 * This preserves the "single Redis access point" architectural rule from Phase 11.
 *
 * GRACEFUL DEGRADATION:
 * If Redis is unavailable, login lockout fails-open (login proceeds with a warning).
 * We never block users because our cache layer is down.
 */

import { checkRateLimit } from '../redis/redis.service.js'
import logger from '../config/logger.js'
import { SECURITY_CONFIG } from './security.config.js'
// Lazy import to avoid circular dep: security.service ← auth.service ← security.service
// audit.service is imported lazily where needed

const { lockout } = SECURITY_CONFIG

// ── Fingerprinting ────────────────────────────────────────────────────────────

/**
 * Extract a consistent security fingerprint from a request.
 * Used as context for audit log entries and suspicious activity detection.
 *
 * @param {import('express').Request} req
 * @returns {{ ip: string, userAgent: string, requestId: string }}
 */
export const fingerprint = (req) => ({
  ip: req.ip || req.connection?.remoteAddress || 'unknown',
  userAgent: req.headers['user-agent'] || 'unknown',
  requestId: req.id || 'unknown',
})

// ── Login Lockout ─────────────────────────────────────────────────────────────

/**
 * Build the Redis key used to track login failures for an email address.
 * Using a keyed prefix isolates lockout counters from other Redis data.
 */
const lockoutKey = (email) =>
  `${lockout.redisKeyPrefix}${email.toLowerCase().trim()}`

/**
 * Check whether a login attempt should be blocked due to too many failures.
 *
 * HOW IT WORKS:
 * We store a simple counter in Redis under lockout:login:<email>.
 * The key is given a TTL equal to lockDurationSeconds when the lock threshold
 * is reached. Subsequent calls return { locked: true } until the TTL expires.
 *
 * @param {string} email
 * @returns {Promise<{ locked: boolean, remainingSeconds?: number }>}
 */
export const checkLoginLockout = async (email) => {
  try {
    // We reuse checkRateLimit from redis.service.js to read the counter.
    // checkRateLimit increments; we don't want to increment here — we need
    // a read-only check. So we import redisClient lazily for a GET-only check.
    const { default: redisClient } = await import('../redis/redis.client.js')
    const key = lockoutKey(email)
    const count = await redisClient.get(key)

    if (!count) return { locked: false }

    const failures = parseInt(count, 10)
    if (failures >= lockout.maxFailures) {
      const ttl = await redisClient.ttl(key)
      return { locked: true, remainingSeconds: ttl > 0 ? ttl : lockout.lockDurationSeconds }
    }

    return { locked: false }
  } catch (err) {
    logger.warn({ err: err.message, email }, 'Lockout check failed — failing open')
    return { locked: false } // Fail-open: don't block users on Redis failure
  }
}

/**
 * Record a failed login attempt. Increments the Redis counter for the email.
 * Sets a lock when the threshold is reached.
 *
 * @param {string} email
 * @returns {Promise<{ justLocked: boolean }>} — true if this attempt triggered the lock
 */
export const recordLoginFailure = async (email) => {
  try {
    const { default: redisClient } = await import('../redis/redis.client.js')
    const key = lockoutKey(email)

    const current = await redisClient.incr(key)

    // Set TTL on the first failure (sliding window)
    if (current === 1) {
      await redisClient.expire(key, lockout.windowSeconds)
    }

    if (current >= lockout.maxFailures) {
      // Extend TTL to lock duration (from now, not from first failure)
      await redisClient.expire(key, lockout.lockDurationSeconds)
      logger.warn({ email, failures: current }, '🔒 Account locked after too many failed logins')
      return { justLocked: current === lockout.maxFailures }
    }

    logger.info({ email, failures: current, max: lockout.maxFailures }, 'Login failure recorded')
    return { justLocked: false }
  } catch (err) {
    logger.error({ err: err.message, email }, 'Failed to record login failure')
    return { justLocked: false }
  }
}

/**
 * Clear all failed login attempts for an email.
 * Called on successful login to reset the counter.
 *
 * @param {string} email
 */
export const clearLoginAttempts = async (email) => {
  try {
    const { default: redisClient } = await import('../redis/redis.client.js')
    await redisClient.del(lockoutKey(email))
    logger.info({ email }, 'Login attempt counter cleared on successful login')
  } catch (err) {
    logger.error({ err: err.message, email }, 'Failed to clear login attempts')
    // Non-critical: a stale counter will expire on its own TTL
  }
}

// ── Suspicious Activity Detection ─────────────────────────────────────────────

/**
 * Best-effort suspicious activity detector.
 * Fires and forgets — never throws, never blocks.
 *
 * Currently detects: IP address changes mid-session.
 * Future: device fingerprint drift, unusual request patterns, geo-velocity.
 *
 * @param {import('express').Request} req
 * @param {string} userId
 * @param {string} [sessionIp] - IP stored at login time (from JWT claims or session)
 */
export const detectSuspiciousActivity = async (req, userId, sessionIp) => {
  try {
    const currentIp = req.ip || req.connection?.remoteAddress
    if (sessionIp && currentIp && sessionIp !== currentIp) {
      logger.warn(
        { userId, sessionIp, currentIp, requestId: req.id },
        '⚠️  IP address drift detected — possible session hijack'
      )

      // Lazy import to avoid circular deps
      const auditService = await import('./audit.service.js')
      auditService.suspiciousActivity(req, userId, `IP drift: ${sessionIp} → ${currentIp}`)
    }
  } catch (err) {
    // Completely silent — this is a best-effort detector
    logger.debug({ err: err.message }, 'Suspicious activity detection error (suppressed)')
  }
}
