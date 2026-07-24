/**
 * redis.service.js — Redis Business Logic Wrapper (Phase 11)
 *
 * Implements cache-aside helpers, rate limiters, token blacklists,
 * and automatic TTL/heartbeat presence tracking. Accesses Redis exclusively via redisClient.
 */

import redisClient from './redis.client.js'
import logger from '../config/logger.js'

// ── 1. Caching Helpers ───────────────────────────────────────────────────────

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key)
    if (data === null) {
      logger.info({ key }, 'Cache MISS')
      return null
    }
    logger.info({ key }, 'Cache HIT')
    return JSON.parse(data)
  } catch (err) {
    logger.error({ key, err: err.message }, 'Failed to read from cache')
    return null
  }
}

export const setCache = async (key, value, ttlSeconds) => {
  try {
    const data = JSON.stringify(value)
    if (ttlSeconds) {
      await redisClient.set(key, data, 'EX', ttlSeconds)
    } else {
      await redisClient.set(key, data)
    }
    // Track key for non-KEYS pattern deletes
    await redisClient.sadd('tracked_keys', key)
  } catch (err) {
    logger.error({ key, err: err.message }, 'Failed to write to cache')
  }
}

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key)
    await redisClient.srem('tracked_keys', key)
    logger.info({ key }, 'Cache invalidated/deleted')
  } catch (err) {
    logger.error({ key, err: err.message }, 'Failed to delete cache key')
  }
}

/**
 * Scan tracked_keys and perform selective deletions. Bypasses KEYS command.
 */
export const deletePattern = async (pattern) => {
  try {
    const keys = await redisClient.smembers('tracked_keys')
    const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$'
    const regex = new RegExp(regexStr)

    const matches = keys.filter((k) => regex.test(k))
    if (matches.length > 0) {
      for (const key of matches) {
        await redisClient.del(key)
        await redisClient.srem('tracked_keys', key)
      }
      logger.info({ pattern, count: matches.length }, 'Pattern cache invalidated')
    }
  } catch (err) {
    logger.error({ pattern, err: err.message }, 'Failed to execute pattern delete')
  }
}

// ── 2. Real-Time Presence Tracking (TTL/Heartbeat Enforced) ─────────────────

/**
 * Register presence for a user, restaurant, or rider.
 */
export const addPresence = async (type, id, socketId, ttlSeconds = 60) => {
  try {
    const onlineKey = `presence:online:${type}:${id}`
    const trackedKey = `presence:tracked:${type}`

    await redisClient.set(onlineKey, socketId, 'EX', ttlSeconds)
    await redisClient.sadd(trackedKey, id)
  } catch (err) {
    logger.error({ type, id, err: err.message }, 'Failed to add presence')
  }
}

/**
 * Explicitly remove presence when a socket disconnects.
 */
export const removePresence = async (type, id) => {
  try {
    const onlineKey = `presence:online:${type}:${id}`
    const trackedKey = `presence:tracked:${type}`

    await redisClient.del(onlineKey)
    await redisClient.srem(trackedKey, id)
  } catch (err) {
    logger.error({ type, id, err: err.message }, 'Failed to remove presence')
  }
}

/**
 * Retrieve list of all verified online IDs, purging expired keys from tracked set.
 */
export const getOnlinePresence = async (type) => {
  try {
    const trackedKey = `presence:tracked:${type}`
    const ids = await redisClient.smembers(trackedKey)
    const onlineIds = []

    for (const id of ids) {
      const onlineKey = `presence:online:${type}:${id}`
      const socketId = await redisClient.get(onlineKey)

      if (socketId) {
        onlineIds.push(id)
      } else {
        // Purge stale ID from tracked set (Self-cleaning)
        await redisClient.srem(trackedKey, id)
      }
    }
    return onlineIds
  } catch (err) {
    logger.error({ type, err: err.message }, 'Failed to query presence list')
    return []
  }
}

// ── 3. Token Blacklist ───────────────────────────────────────────────────────

export const blacklistToken = async (jti, expireSeconds) => {
  try {
    const key = `blacklist:token:${jti}`
    if (expireSeconds && expireSeconds > 0) {
      await redisClient.set(key, 'revoked', 'EX', Math.ceil(expireSeconds))
    } else {
      await redisClient.set(key, 'revoked')
    }
    logger.info({ jti }, 'Token blacklisted successfully')
  } catch (err) {
    logger.error({ jti, err: err.message }, 'Failed to blacklist token')
  }
}

export const isTokenBlacklisted = async (jti) => {
  try {
    const key = `blacklist:token:${jti}`
    const val = await redisClient.get(key)
    return val !== null
  } catch (err) {
    logger.error({ jti, err: err.message }, 'Blacklist query error')
    return false
  }
}

// ── 4. Rate Limiting ─────────────────────────────────────────────────────────

export const checkRateLimit = async (key, limit, windowSeconds) => {
  try {
    const countKey = `ratelimit:${key}`
    const current = await redisClient.incrby(countKey, 1)

    if (current === 1) {
      await redisClient.expire(countKey, windowSeconds)
    }

    if (current > limit) {
      logger.warn({ key, current, limit }, 'Rate limit exceeded')
      return false
    }

    return true
  } catch (err) {
    logger.error({ key, err: err.message }, 'Rate limiter verification error')
    return true // Graceful fallback: allow request on Redis failure
  }
}

// ── 5. Cache Warming Helpers ──────────────────────────────────────────────────

export const warmupPlatformSettings = async () => {
  try {
    const { getSettings } = await import('../services/admin.service.js')
    const settings = await getSettings()
    logger.info('Platform settings cache warmed successfully.')
    return settings
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to warmup platform settings cache')
  }
}

export const warmupRestaurantAndMenu = async (idOrSlug) => {
  try {
    const { getRestaurant, getMenu } = await import('../services/restaurant.service.js')
    const restaurant = await getRestaurant(idOrSlug)
    // Warm menu with restaurant ID to ensure it is stored under ID prefix
    const menu = await getMenu(restaurant.id)
    logger.info({ idOrSlug }, 'Restaurant and menu cache warmed successfully.')
    return { restaurant, menu }
  } catch (err) {
    logger.error({ idOrSlug, err: err.message }, 'Failed to warmup restaurant/menu cache')
  }
}

export const warmupAllRestaurants = async () => {
  try {
    const prisma = (await import('../config/db.js')).default
    const restaurants = await prisma.restaurant.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
    })
    for (const r of restaurants) {
      await warmupRestaurantAndMenu(r.id)
    }
    logger.info({ count: restaurants.length }, 'Warmed cache for all active restaurants')
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to warmup all restaurants cache')
  }
}
