/**
 * redis.client.js — Redis Client Manager with Graceful In-Memory Fallback (Phase 11)
 *
 * Exposes a Proxy client wrapper that routes calls to ioredis when online,
 * and seamlessly intercepts and falls back to memoryFallback if offline.
 */

import Redis from 'ioredis'
import { env } from '../config/env.js'
import logger from '../config/logger.js'
import memoryFallback from './memoryFallback.js'

let isRedisAvailable = false
let redisInstance = null

// Only construct client if not in test env where we want to verify fallback cleanly
if (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_REDIS) {
  try {
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis connection retry limit reached. Falling back to in-memory store.')
          return null // Stop retrying
        }
        return Math.min(times * 100, 1000)
      },
    })

    redisInstance.on('connect', () => {
      isRedisAvailable = true
      logger.info('Connected to Redis server successfully.')
    })

    redisInstance.on('error', (err) => {
      isRedisAvailable = false
      logger.warn(`Redis connection error: ${err.message}. Relying on in-memory fallback.`)
    })

    redisInstance.on('end', () => {
      isRedisAvailable = false
      logger.warn('Redis server connection ended.')
    })
  } catch (err) {
    logger.warn(`Failed to construct Redis client: ${err.message}. Relying on in-memory fallback.`)
  }
} else {
  logger.info('Test environment: defaulting to in-memory fallback client.')
}

// Proxy wrapper that routes calls dynamically based on availability
export const redisClient = new Proxy(
  {},
  {
    get(target, prop) {
      if (isRedisAvailable && redisInstance) {
        const value = redisInstance[prop]
        if (typeof value === 'function') {
          return (...args) => value.apply(redisInstance, args)
        }
        return value
      } else {
        const value = memoryFallback[prop]
        if (typeof value === 'function') {
          return (...args) => value.apply(memoryFallback, args)
        }
        return value
      }
    },
  }
)

export const getRedisStatus = () => ({
  isAvailable: isRedisAvailable,
  clientType: isRedisAvailable ? 'ioredis' : 'memoryFallback',
})

// Helper to manually toggle availability state for fallback testing
export const setMockRedisAvailability = (state) => {
  isRedisAvailable = state
}

export default redisClient
