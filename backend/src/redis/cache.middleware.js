/**
 * cache.middleware.js — Cache-Aside and Rate-Limiting Express Middlewares (Phase 11)
 *
 * Implements route response caching interceptors and client IP rate limiting checks.
 */

import { getCache, setCache, checkRateLimit } from './redis.service.js'
import { ApiError } from '../utils/ApiError.js'
import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'

/**
 * Route response caching middleware.
 * Intercepts res.json to capture response body and populate the cache.
 */
export const cacheMiddleware = (keyGenerator, ttlSeconds) => async (req, res, next) => {
  const cacheKey = typeof keyGenerator === 'function' ? keyGenerator(req) : keyGenerator

  if (!cacheKey) {
    return next()
  }

  const cachedData = await getCache(cacheKey)
  if (cachedData) {
    return res.status(HTTP.OK).json(cachedData)
  }

  // Intercept response write
  const originalJson = res.json
  res.json = function (body) {
    res.json = originalJson

    // Only cache successful JSON payloads
    if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success) {
      // Store in cache asynchronously without blocking client response
      setCache(cacheKey, body, ttlSeconds).catch(() => {})
    }

    return originalJson.call(this, body)
  }

  next()
}

/**
 * Route-specific Rate Limiting Middleware.
 */
export const rateLimitMiddleware = (endpoint, limit, windowSeconds) => async (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  const key = `${endpoint}:${clientIp.replace(/:/g, '_')}`

  const isAllowed = await checkRateLimit(key, limit, windowSeconds)
  if (!isAllowed) {
    return next(new ApiError(HTTP.TOO_MANY_REQUESTS, MSG.TOO_MANY_REQUESTS))
  }

  next()
}
