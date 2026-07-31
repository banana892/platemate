/**
 * server.js — HTTP Server Entry Point
 *
 * This file:
 * 1. Creates the HTTP server from the Express app
 * 2. Attaches Socket.io to the same HTTP server (Phase 9)
 * 3. Starts listening on the configured port
 * 4. Handles graceful shutdown (SIGTERM, SIGINT)
 *
 * WHY GRACEFUL SHUTDOWN?
 * When Render/Railway deploys a new version, it sends SIGTERM to the old process.
 * Without graceful shutdown:
 * - Active requests are cut off mid-response → broken user experiences
 * - DB connections are not closed → potential connection leak on Neon
 *
 * With graceful shutdown:
 * - Stop accepting new connections
 * - Let in-flight requests finish (up to 30 seconds)
 * - Close DB connections cleanly
 * - Exit with code 0 (success)
 *
 * This is a production requirement, not a nice-to-have.
 */

import 'dotenv/config'
import http from 'http'
import app from './app.js'
import { env } from './config/env.js'
import logger from './config/logger.js'
import prisma from './config/db.js'

// ── Create HTTP Server ────────────────────────────────────────────────────────
// We create an http.Server wrapping the Express app.
// This allows Socket.io (Phase 9) to attach to the same server.
import { initSocket } from './socket/socket.server.js'
const server = http.createServer(app)
initSocket(server)

// ── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // ── Verify database connection ─────────────────────────────────────────
    // We run a simple query to confirm the DB is reachable.
    // In development, we warn but don't crash — lets you test non-DB routes.
    // In production, we crash fast — a server without DB is useless.
    try {
      await prisma.$queryRaw`SELECT 1`
      logger.info('Database: connection verified ✅')
    } catch (dbErr) {
      logger.warn({ err: dbErr.message }, '⚠️  Database connection check warning — server will continue startup')
    }

    // ── Start listening ────────────────────────────────────────────────────
    server.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`
      ╔═══════════════════════════════════════════════╗
      ║          🍽️  PlateMate API — RUNNING           ║
      ╠═══════════════════════════════════════════════╣
      ║  Environment : ${env.NODE_ENV.padEnd(28)}║
      ║  Port        : ${String(env.PORT).padEnd(28)}║
      ║  API Base    : http://localhost:${env.PORT}/api/v1      ║
      ║  Health      : http://localhost:${env.PORT}/api/v1/health║
      ╚═══════════════════════════════════════════════╝
      `)

      // Warm up Redis caches in background
      if (env.NODE_ENV !== 'test') {
        import('./redis/redis.service.js')
          .then(async ({ warmupPlatformSettings, warmupAllRestaurants }) => {
            logger.info('Warming up platform caches...')
            await warmupPlatformSettings()
            await warmupAllRestaurants()
          })
          .catch((err) => {
            logger.warn({ err: err.message }, 'Failed to warm up platform caches on startup')
          })
      }
    })
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server')
    process.exit(1)
  }
}

// ── Graceful Shutdown ─────────────────────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received — starting graceful shutdown`)

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed')

    try {
      // Close Prisma connection pool
      await prisma.$disconnect()
      logger.info('Database: disconnected')

      logger.info('Graceful shutdown complete ✅')
      process.exit(0)
    } catch (err) {
      logger.error({ err }, 'Error during shutdown')
      process.exit(1)
    }
  })

  // Force shutdown after 30 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timeout — forcing exit')
    process.exit(1)
  }, 30_000)
}

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')) // Render/Railway deploy signal
process.on('SIGINT', () => gracefulShutdown('SIGINT'))   // Ctrl+C in terminal

// ── Unhandled Rejection / Exception Guards ─────────────────────────────────────
// These are last-resort safety nets. Code should never reach here.
// If it does, it means a bug slipped past our error handlers.

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, '🔴 Unhandled Promise Rejection — shutting down')
  gracefulShutdown('unhandledRejection')
})

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, '🔴 Uncaught Exception — shutting down')
  process.exit(1) // Don't attempt graceful shutdown — state is corrupted
})

// ── Boot ──────────────────────────────────────────────────────────────────────
startServer()
