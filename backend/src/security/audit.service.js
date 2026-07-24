/**
 * audit.service.js — Security Audit Logging (Phase 13)
 *
 * WHY A DEDICATED AUDIT SERVICE?
 * Security events (login failures, lockouts, suspicious activity) must be
 * persisted to PostgreSQL for compliance, incident response, and admin review.
 *
 * DESIGN PRINCIPLES:
 * 1. Fire-and-forget: logAuditEvent() NEVER awaited by callers.
 *    If the audit write fails, the request continues — we log the failure
 *    via Pino but never block or crash the user-facing operation.
 * 2. Severity defaults: each AuditAction has a default severity defined in
 *    SECURITY_CONFIG.auditSeverity. Callers may override by passing severity.
 * 3. Request ID threading: requestId from req.id is included in every entry
 *    so log lines and DB records can be correlated.
 * 4. Never throws: all errors are caught and logged silently.
 */

import prisma from '../config/db.js'
import logger from '../config/logger.js'
import { SECURITY_CONFIG } from './security.config.js'

/**
 * Log a security-relevant audit event to PostgreSQL.
 * Call this with .catch(() => {}) or without await — it must never block.
 *
 * @param {object} params
 * @param {string} [params.requestId] - From req.id (request correlation)
 * @param {string} [params.userId]    - Authenticated user ID, if known
 * @param {string}  params.action     - AuditAction enum value
 * @param {string} [params.severity]  - AuditSeverity override (INFO/WARNING/CRITICAL)
 * @param {string} [params.ip]        - Client IP address
 * @param {string} [params.userAgent] - Client User-Agent header
 * @param {object} [params.meta]      - Additional structured context (JSON-serializable)
 */
export const logAuditEvent = async ({
  requestId,
  userId,
  action,
  severity,
  ip,
  userAgent,
  meta,
} = {}) => {
  try {
    // Resolve severity: caller override > config default > INFO
    const resolvedSeverity =
      severity || SECURITY_CONFIG.auditSeverity[action] || 'INFO'

    await prisma.auditLog.create({
      data: {
        requestId: requestId || null,
        userId: userId || null,
        action,
        severity: resolvedSeverity,
        ip: ip || null,
        userAgent: userAgent ? userAgent.slice(0, 500) : null, // Cap UA string length
        meta: meta || undefined,
      },
    })
  } catch (err) {
    // Audit write failure must NEVER propagate to the caller.
    // Log it internally and move on.
    logger.error(
      { err: err.message, action, userId },
      '⚠️  Audit log write failed — security event not persisted'
    )
  }
}

/**
 * Convenience wrappers for the most common audit actions.
 * These make call sites readable: auditService.loginSuccess(req, userId)
 */
export const loginSuccess = (req, userId) =>
  logAuditEvent({
    requestId: req.id,
    userId,
    action: 'LOGIN_SUCCESS',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { email: req.body?.email },
  })

export const loginFailure = (req, email) =>
  logAuditEvent({
    requestId: req.id,
    action: 'LOGIN_FAILURE',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { email },
  })

export const accountLocked = (req, email) =>
  logAuditEvent({
    requestId: req.id,
    action: 'ACCOUNT_LOCKED',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { email },
  })

export const passwordChanged = (req, userId) =>
  logAuditEvent({
    requestId: req.id,
    userId,
    action: 'PASSWORD_CHANGED',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  })

export const tokenRevoked = (req, userId) =>
  logAuditEvent({
    requestId: req.id,
    userId,
    action: 'TOKEN_REVOKED',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  })

export const uploadRejected = (req, userId, reason) =>
  logAuditEvent({
    requestId: req.id,
    userId: userId || null,
    action: 'UPLOAD_REJECTED',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { reason },
  })

export const suspiciousActivity = (req, userId, reason) =>
  logAuditEvent({
    requestId: req.id,
    userId: userId || null,
    action: 'SUSPICIOUS_ACTIVITY',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { reason },
  })

export const permissionDenied = (req, userId, resource) =>
  logAuditEvent({
    requestId: req.id,
    userId: userId || null,
    action: 'PERMISSION_DENIED',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { resource },
  })

export const adminAction = (req, userId, action, meta) =>
  logAuditEvent({
    requestId: req.id,
    userId,
    action: 'ADMIN_ACTION',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    meta: { action, ...meta },
  })
