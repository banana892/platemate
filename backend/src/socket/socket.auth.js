/**
 * socket.auth.js — JWT Authentication Middleware for Socket.io (Phase 9)
 *
 * Validates connection handshakes against active DB state to maintain clean session lifecycle.
 */

import { verifyAccessToken } from '../utils/jwt.js'
import prisma from '../config/db.js'
import logger from '../config/logger.js'
import crypto from 'crypto'
import { isTokenBlacklisted } from '../redis/redis.service.js'

export const socketAuth = async (socket, next) => {
  try {
    // 1. Resolve token from handshake auth or query string
    const token = socket.handshake.auth?.token || socket.handshake.query?.token

    if (!token) {
      logger.warn({ socketId: socket.id }, 'Socket connection rejected: No token provided')
      return next(new Error('Authentication error: Token is required'))
    }

    // 2. Verify token payload
    const payload = verifyAccessToken(token)

    // 3. Redis blacklist check — consistent with REST auth.js middleware
    // Tokens that have been explicitly revoked (e.g., via logout) are blocked here.
    try {
      const signature = token.split('.')[2] || token
      const tokenId = crypto.createHash('sha256').update(signature).digest('hex')
      const revoked = await isTokenBlacklisted(tokenId)
      if (revoked) {
        logger.warn({ socketId: socket.id }, 'Socket connection rejected: Token revoked')
        return next(new Error('Authentication error: Session revoked'))
      }
    } catch (err) {
      // Graceful fallback: if Redis is unavailable, allow connection (fail-open)
      if (!(err instanceof Error && err.message.includes('Session revoked'))) {
        logger.warn({ err: err.message }, 'Socket blacklist check failed — failing open')
      } else {
        return next(err)
      }
    }

    // 4. Verify user status in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        tokenVersion: true,
        deletedAt: true,
      },
    })

    if (!user || user.deletedAt) {
      logger.warn({ socketId: socket.id, userId: payload.userId }, 'Socket connection rejected: User not found')
      return next(new Error('Authentication error: User not found'))
    }

    if (!user.isActive) {
      logger.warn({ socketId: socket.id, userId: payload.userId }, 'Socket connection rejected: Account suspended')
      return next(new Error('Authentication error: Account suspended'))
    }

    if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
      logger.warn({ socketId: socket.id, userId: payload.userId }, 'Socket connection rejected: Token version expired')
      return next(new Error('Authentication error: Session expired'))
    }

    // 4. Attach verified user record to socket instance
    socket.user = user
    next()
  } catch (err) {
    logger.warn({ socketId: socket.id, err: err.message }, 'Socket authentication error')
    return next(new Error(`Authentication error: ${err.message}`))
  }
}
