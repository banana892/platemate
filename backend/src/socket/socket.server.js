/**
 * socket.server.js — Socket.io Server Initialization & Entry Point (Phase 9)
 *
 * Attaches real-time capability to the HTTP server, applies guards, and binds client lifecycle handlers.
 */

import { Server } from 'socket.io'
import logger from '../config/logger.js'
import { allowedOrigins } from '../config/env.js'
import { socketAuth } from './socket.auth.js'
import { socketLoggingMiddleware } from './socket.middleware.js'
import { handleConnection } from './socket.handlers.js'

let io = null

/**
 * Initialize the Socket.io server wrapping the HTTP server.
 */
export const initSocket = (httpServer) => {
  if (io) {
    logger.warn('Socket.io server already initialized')
    return io
  }

  logger.info('Initializing Socket.io server...')

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow connections with no origin (e.g. mobile apps, test scripts)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          logger.warn({ origin }, 'CORS: blocked socket connection from unauthorized origin')
          callback(new Error('Not allowed by CORS policy'))
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // 1. Apply Handshake Authentication Middleware
  io.use(socketAuth)

  // 2. Binds Connection Event Handler
  io.on('connection', (socket) => {
    // Apply event logging middleware to connection context
    socketLoggingMiddleware(socket, () => {
      handleConnection(socket, io)
    })
  })

  logger.info('Socket.io server successfully initialized and attached ✅')
  return io
}

/**
 * Retrieve the active Socket.io Server instance.
 */
export const getIo = () => {
  return io
}
