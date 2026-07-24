/**
 * socket.rateLimiter.js — Socket.io Event Rate Limiter (Phase 13)
 *
 * WHY RATE LIMIT SOCKET EVENTS?
 * Unlike HTTP where each connection is stateless, a single persistent socket
 * connection can flood the server with thousands of events per second with
 * minimal CPU cost on the client side. Without a limit:
 * - A single malicious client can monopolize server event processing
 * - Broadcasting events (e.g., location updates) become a DDoS vector
 *
 * WHY IN-MEMORY (NOT REDIS)?
 * Socket connections are per-server-instance (unless using Redis adapter).
 * Since we're not using the Redis Socket.io adapter, a per-socket in-memory
 * counter is sufficient and avoids an unnecessary Redis round-trip on every
 * socket event — the most performance-sensitive path in the system.
 *
 * DESIGN: SLIDING WINDOW
 * We track (count, windowStart) per socket. When the window expires, the
 * counter resets automatically. This is simpler and more permissive than
 * a fixed window, giving clients a fair burst allowance.
 *
 * CLEANUP:
 * Maps are keyed by socket.id. Entries are deleted on socket disconnect
 * to prevent memory leaks in long-running processes.
 */

import { SECURITY_CONFIG } from '../security/security.config.js'
import logger from '../config/logger.js'

const { maxEventsPerWindow, windowMs } = SECURITY_CONFIG.socket

// Per-socket state: Map<socketId, { count: number, windowStart: number }>
const socketCounters = new Map()

/**
 * Create a per-socket sliding window event rate limiter.
 *
 * Usage in socket.middleware.js:
 *   socket.use(createSocketRateLimiterMiddleware(socket))
 *
 * @param {import('socket.io').Socket} socket
 * @returns {Function} Socket.io use() middleware function
 */
export const createSocketRateLimiterMiddleware = (socket) => {
  return ([event, ...args], next) => {
    const now = Date.now()
    const state = socketCounters.get(socket.id)

    if (!state || now - state.windowStart >= windowMs) {
      // New window: reset counter
      socketCounters.set(socket.id, { count: 1, windowStart: now })
      return next()
    }

    state.count += 1

    if (state.count > maxEventsPerWindow) {
      logger.warn(
        {
          socketId: socket.id,
          userId: socket.user?.id,
          event,
          count: state.count,
          limit: maxEventsPerWindow,
        },
        '🚫 Socket rate limit exceeded — disconnecting client'
      )

      // Notify the client before disconnecting (gives them a chance to show UI feedback)
      socket.emit('error', {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Event rate limit exceeded (${maxEventsPerWindow} events per ${windowMs / 1000}s). Please reconnect.`,
      })

      socket.disconnect(true)
      return // Do NOT call next() — event is dropped
    }

    next()
  }
}

/**
 * Clean up the counter entry when a socket disconnects.
 * MUST be called in the disconnect handler to prevent memory leaks.
 *
 * @param {string} socketId
 */
export const cleanupSocketCounter = (socketId) => {
  socketCounters.delete(socketId)
}

/**
 * Get current event count for a socket (useful for testing/debugging).
 *
 * @param {string} socketId
 * @returns {{ count: number, windowStart: number } | undefined}
 */
export const getSocketState = (socketId) => socketCounters.get(socketId)
