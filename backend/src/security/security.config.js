/**
 * security.config.js — Centralized Security Configuration
 *
 * WHY THIS EXISTS:
 * Security constants scattered across the codebase create two problems:
 * 1. Inconsistency: different modules use different lockout windows
 * 2. Hardening friction: adjusting a threshold requires touching multiple files
 *
 * By centralizing all security-relevant constants here, we:
 * - Guarantee consistency across every module that enforces the same policy
 * - Make security reviews trivial — one file to audit
 * - Allow environment-level overrides by reading from env where appropriate
 *
 * USAGE:
 *   import { SECURITY_CONFIG } from '../security/security.config.js'
 *   const { maxFailures, windowSeconds } = SECURITY_CONFIG.lockout
 */

export const SECURITY_CONFIG = {
  // ── Login Lockout ───────────────────────────────────────────────────────────
  // After maxFailures failed attempts within windowSeconds, the account is locked
  // for lockDurationSeconds. Counters are stored in Redis with sliding TTL.
  lockout: {
    maxFailures: 5,
    windowSeconds: 15 * 60,        // 15-minute sliding window
    lockDurationSeconds: 15 * 60,  // Lock duration matches window
    redisKeyPrefix: 'lockout:login:',
  },

  // ── Password Policy ─────────────────────────────────────────────────────────
  // Rules enforced at the service layer (password.service.js).
  // Must stay in sync with auth.validator.js Zod schema rules.
  password: {
    minLength: 8,
    historyDepth: 5,          // Reject if matching any of the last N passwords
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecial: true,
    specialChars: '!@#$%^&*()_+-=[]{};\':"|,.<>/?`~',
  },

  // ── File Upload Validation ──────────────────────────────────────────────────
  // Magic bytes are the first N bytes of a valid file of that type.
  // These are checked AFTER multer parses the buffer to catch content spoofing
  // (e.g., a PHP script renamed to .jpg).
  upload: {
    maxSizeBytes: 5 * 1024 * 1024,  // 5 MB — matches multer limit in upload.js
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    magicBytes: {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png':  [0x89, 0x50, 0x4E, 0x47],
      // WEBP: first 4 bytes are RIFF, bytes 8-11 are WEBP — check both
      'image/webp': [0x52, 0x49, 0x46, 0x46],
    },
    // Additional WEBP marker at offset 8 (checked separately in validateFileSignature)
    webpMarker: [0x57, 0x45, 0x42, 0x50],
  },

  // ── Socket.io Event Rate Limiting ──────────────────────────────────────────
  // In-memory per-socket counter. Prevents event flooding without Redis.
  socket: {
    maxEventsPerWindow: 60,
    windowMs: 60_000,  // 60 events per minute
  },

  // ── Endpoint-Specific Rate Limiters ─────────────────────────────────────────
  // Applied on top of the general API rate limiter in rateLimiter.js.
  rateLimit: {
    paymentVerify: {
      windowMs: 10 * 60_000,  // 10-minute window
      max: 10,                 // 10 attempts per window per IP
      message: 'Too many payment verification attempts. Please wait 10 minutes.',
    },
    webhook: {
      windowMs: 60_000,        // 1-minute window
      max: 100,                // 100 webhook events per minute (trusted source)
      message: 'Webhook rate limit exceeded.',
    },
  },

  // ── Content Security Policy ─────────────────────────────────────────────────
  // reportOnly: true  → sends CSP-Report-Only header (browser logs violations, doesn't block)
  //             false → sends Content-Security-Policy header (browser blocks violations)
  //
  // Use reportOnly = true when first rolling out CSP to a new environment.
  // Switch to false once you've confirmed no legitimate resources are blocked.
  csp: {
    reportOnly: false,
    reportUri: '/api/v1/security/csp-report',
    directives: {
      defaultSrc:              ["'none'"],
      scriptSrc:               ["'self'"],
      styleSrc:                ["'self'"],
      imgSrc:                  ["'self'", 'res.cloudinary.com', 'data:'],
      connectSrc:              ["'self'"],
      fontSrc:                 ["'self'"],
      objectSrc:               ["'none'"],
      frameSrc:                ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // ── Audit Severity Defaults per Action ─────────────────────────────────────
  // Determines the default severity written to AuditLog for each action type.
  // Can be overridden by passing { severity } explicitly to logAuditEvent().
  auditSeverity: {
    LOGIN_SUCCESS:        'INFO',
    LOGIN_FAILURE:        'WARNING',
    LOGOUT:               'INFO',
    PASSWORD_CHANGED:     'INFO',
    ACCOUNT_LOCKED:       'CRITICAL',
    TOKEN_REVOKED:        'INFO',
    ADMIN_ACTION:         'INFO',
    SUSPICIOUS_ACTIVITY:  'CRITICAL',
    RATE_LIMIT_EXCEEDED:  'WARNING',
    UPLOAD_REJECTED:      'WARNING',
    PERMISSION_DENIED:    'WARNING',
  },
}
