/**
 * requestId.js — Unique Request ID Middleware (Phase 13)
 *
 * WHY REQUEST IDs?
 * In production, a single user action may touch dozens of log lines across
 * multiple middleware, services, and repositories. Without a shared identifier,
 * correlating those log lines to a single request requires guessing from
 * timestamps and IP addresses — fragile and slow.
 *
 * With a request ID:
 * - Every Pino log line carries { requestId: "uuid-v4" }
 * - Every AuditLog entry references the same ID
 * - Error responses include the ID so users can report it to support
 * - Log aggregators (Datadog, Grafana Loki) can filter to a single request
 *
 * CLIENT-SENT IDs:
 * If the client sends an X-Request-ID header (common in frontend frameworks
 * and API gateways), we use that value instead of generating our own.
 * This enables end-to-end tracing from the frontend to the backend log.
 * The header value is sanitized to prevent header injection.
 *
 * IMPLEMENTATION:
 * Uses crypto.randomUUID() — available in Node.js 14.17+ with no dependencies.
 */

import { randomUUID } from 'crypto'

/**
 * Sanitize a client-provided request ID.
 * Allow only alphanumeric, hyphens, and underscores (standard UUID/trace ID chars).
 * Truncate to 128 chars to prevent oversized headers.
 *
 * @param {string} id
 * @returns {string|null} Sanitized ID or null if invalid
 */
const sanitizeIncomingRequestId = (id) => {
  if (!id || typeof id !== 'string') return null
  const sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 128)
  return sanitized.length >= 8 ? sanitized : null // Must be at least 8 chars to be useful
}

/**
 * Request ID middleware.
 *
 * Attaches a unique req.id to every request and echoes it back as
 * the X-Request-ID response header for client-side correlation.
 */
const requestId = (req, res, next) => {
  // Prefer client-provided ID (forwarded by API gateway or frontend)
  const clientId = sanitizeIncomingRequestId(req.headers['x-request-id'])
  req.id = clientId || randomUUID()

  // Echo back so the client can correlate their request with server logs
  res.setHeader('X-Request-ID', req.id)

  next()
}

export default requestId
