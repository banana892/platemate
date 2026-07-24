/**
 * rateLimiter.js — Rate Limiting Middleware
 *
 * WHY RATE LIMIT?
 * Without rate limiting:
 * - An attacker can try millions of passwords per second (brute force)
 * - A bot can scrape your entire restaurant database in seconds
 * - A DDoS can bring down your server with flood requests
 *
 * Rate limiting is your first line of defense at the application layer
 * (before expensive DB queries are even attempted).
 *
 * STRATEGY:
 * Different routes get different limits:
 * - Login/Register: Very strict (5 attempts per 15 minutes)
 * - API in general: Moderate (100 requests per minute)
 * - Password reset: Very strict (3 per hour)
 *
 * REDIS-BACKED (Phase 11):
 * The default express-rate-limit uses in-memory storage.
 * In production with multiple server instances, in-memory limits don't share
 * state. In Phase 11, we'll swap to a Redis store so all instances share
 * the same rate limit counters.
 */

import rateLimit from 'express-rate-limit'
import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import { SECURITY_CONFIG } from '../security/security.config.js'

// ── General API limiter ────────────────────────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,              // 100 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: MSG.TOO_MANY_REQUESTS,
  },
})

// ── Strict limiter for auth endpoints ────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
})

// ── Password reset limiter ────────────────────────────────────────────────────
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                    // 3 reset emails per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Too many password reset requests. Please wait an hour before trying again.',
  },
})

// ── Upload limiter ────────────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                   // 20 uploads per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Upload limit reached. Please try again later.',
  },
})

// ── Payment verification limiter (Phase 13) ────────────────────────────────────────────────
// Payment verification is a high-value endpoint — brute-forcing signature
// parameters could allow fraudulent payment captures.
export const paymentVerifyLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.rateLimit.paymentVerify.windowMs,
  max: SECURITY_CONFIG.rateLimit.paymentVerify.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: SECURITY_CONFIG.rateLimit.paymentVerify.message,
  },
})

// ── Webhook limiter (Phase 13) ────────────────────────────────────────────────────────────────
// Webhooks arrive at high volume from Razorpay. This limit protects against
// replay attacks without blocking legitimate high-frequency events.
export const webhookLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.rateLimit.webhook.windowMs,
  max: SECURITY_CONFIG.rateLimit.webhook.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: SECURITY_CONFIG.rateLimit.webhook.message,
  },
})
