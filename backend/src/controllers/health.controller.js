/**
 * health.controller.js — Centralized Production Health Check Controller
 *
 * Used by load balancers, cloud platform monitors (Render, Railway, Fly.io, AWS),
 * and deployment verification scripts to verify backend vitality and database readiness.
 */

import prisma from '../config/db.js'

export const getHealth = async (req, res) => {
  let dbStatus = 'healthy'
  let dbError = null

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    dbStatus = 'unhealthy'
    dbError = err.message
  }

  const isHealthy = dbStatus === 'healthy'

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'ok' : 'degraded',
    service: 'platemate-api',
    version: 'v1',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      ...(dbError && { error: dbError }),
    },
  })
}
