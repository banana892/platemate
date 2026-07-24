/**
 * socket.middleware.js — General Socket.io Middlewares
 */

import logger from '../config/logger.js'
import { createSocketRateLimiterMiddleware, cleanupSocketCounter } from './socket.rateLimiter.js'

/**
 * Socket logging middleware + event rate limiter.
 * Logs client events for tracing and enforces per-socket event rate limits.
 */
export const socketLoggingMiddleware = (socket, next) => {
  logger.debug({ socketId: socket.id, userId: socket.user?.id }, 'Socket client initialized')

  // Apply per-socket event rate limiter
  socket.use(createSocketRateLimiterMiddleware(socket))

  // Log incoming packets (after rate limit check passes)
  socket.use(([event, ...args], nextEvent) => {
    logger.debug({ socketId: socket.id, event, userId: socket.user?.id }, 'Socket event received')
    nextEvent()
  })

  // Clean up rate limiter counter on disconnect to prevent memory leak
  socket.on('disconnect', () => {
    cleanupSocketCounter(socket.id)
  })

  next()
}
