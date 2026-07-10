/**
 * redis.js — Redis Client (ioredis)
 *
 * WHY IOREDIS OVER node-redis?
 * - Built-in automatic reconnection with exponential backoff
 * - Supports Cluster, Sentinel, and Upstash (TLS) out of the box
 * - Better TypeScript support
 * - Supports pipelines and transactions natively
 *
 * GRACEFUL DEGRADATION:
 * Redis is a performance layer, not a correctness layer. If Redis goes down,
 * the app should still work — just slower (DB queries instead of cache).
 * That's why we log errors but don't throw them.
 */

import Redis from 'ioredis'
import { env, isDev } from './env.js'
import logger from './logger.js'

let redis

const createRedisClient = () => {
  const client = new Redis(env.REDIS_URL, {
    // Retry connection up to 3 times with exponential backoff
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis: max retry attempts reached. Running without cache.')
        return null // Stop retrying
      }
      return Math.min(times * 200, 2000) // Backoff: 200ms, 400ms, 600ms...
    },
    // In production, Upstash requires TLS
    tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    // Disable auto-connect in test environment
    lazyConnect: env.NODE_ENV === 'test',
    enableOfflineQueue: false, // Don't queue commands when disconnected
    maxRetriesPerRequest: 3,
  })

  client.on('connect', () => {
    logger.info('Redis: connected')
  })

  client.on('error', (err) => {
    // Don't crash the server if Redis goes down — gracefully degrade
    logger.error({ err }, 'Redis: connection error')
  })

  client.on('reconnecting', () => {
    logger.warn('Redis: reconnecting...')
  })

  if (isDev) {
    client.on('ready', () => {
      logger.info('Redis: ready to accept commands')
    })
  }

  return client
}

// Singleton — reuse the same connection
redis = createRedisClient()

export default redis
