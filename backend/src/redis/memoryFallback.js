/**
 * memoryFallback.js — In-Memory Failback Cache Database (Phase 11)
 *
 * Implements equivalent Redis command endpoints using in-memory Javascript structures
 * with TTL lifecycle enforcement. Prevents service interruption if Redis goes offline.
 */

import logger from '../config/logger.js'

class MemoryFallbackStore {
  constructor() {
    this.store = new Map()       // Normal keys -> { value, expiresAt }
    this.sets = new Map()        // Set keys -> Map<member, expiresAt>
    this.hashes = new Map()      // Hash keys -> Map<field, value> (hashes can have global TTL or per-field)
    this.hashExpires = new Map() // Hash keys -> expiresAt
  }

  // Helper to garbage collect expired keys on request
  _isExpired(item) {
    if (!item) return true
    if (item.expiresAt && Date.now() > item.expiresAt) {
      return true
    }
    return false
  }

  async get(key) {
    const item = this.store.get(key)
    if (this._isExpired(item)) {
      if (item) this.store.delete(key)
      return null
    }
    return item.value
  }

  async set(key, value, flag, expireSeconds) {
    let expiresAt = null
    if (flag === 'EX' && expireSeconds) {
      expiresAt = Date.now() + Number(expireSeconds) * 1000
    }
    this.store.set(key, { value, expiresAt })
    return 'OK'
  }

  async del(key) {
    let deleted = false
    if (this.store.has(key)) {
      this.store.delete(key)
      deleted = true
    }
    if (this.sets.has(key)) {
      this.sets.delete(key)
      deleted = true
    }
    if (this.hashes.has(key)) {
      this.hashes.delete(key)
      this.hashExpires.delete(key)
      deleted = true
    }
    return deleted ? 1 : 0
  }

  async keys(pattern) {
    // Basic regex conversion from glob patterns
    const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$'
    const regex = new RegExp(regexStr)
    const result = []

    // Check store
    for (const [key, item] of this.store.entries()) {
      if (!this._isExpired(item) && regex.test(key)) {
        result.push(key)
      }
    }
    // Check sets
    for (const key of this.sets.keys()) {
      if (regex.test(key)) result.push(key)
    }
    // Check hashes
    for (const [key, expiresAt] of this.hashExpires.entries()) {
      if (expiresAt && Date.now() > expiresAt) {
        this.hashes.delete(key)
        this.hashExpires.delete(key)
        continue
      }
      if (regex.test(key)) result.push(key)
    }

    return result
  }

  async incr(key) {
    return this.incrby(key, 1)
  }

  async incrby(key, amount) {
    const item = this.store.get(key)
    let currentVal = 0

    if (item && !this._isExpired(item)) {
      currentVal = parseInt(item.value, 10) || 0
    }

    const newVal = currentVal + Number(amount)
    this.store.set(key, {
      value: String(newVal),
      expiresAt: item ? item.expiresAt : null,
    })
    return newVal
  }

  async ttl(key) {
    const item = this.store.get(key)
    if (!item) return -2 // Key does not exist
    if (!item.expiresAt) return -1 // Key has no expiration
    const remaining = Math.round((item.expiresAt - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }

  async expire(key, expireSeconds) {
    const expiresAt = Date.now() + Number(expireSeconds) * 1000

    if (this.store.has(key)) {
      const item = this.store.get(key)
      item.expiresAt = expiresAt
      return 1
    }
    if (this.hashes.has(key)) {
      this.hashExpires.set(key, expiresAt)
      return 1
    }
    return 0 // Key not found
  }

  // ── Set Operations ─────────────────────────────────────────────────────────

  async sadd(key, member) {
    let set = this.sets.get(key)
    if (!set) {
      set = new Set()
      this.sets.set(key, set)
    }
    const had = set.has(member)
    set.add(member)
    return had ? 0 : 1
  }

  async srem(key, member) {
    const set = this.sets.get(key)
    if (!set) return 0
    const had = set.has(member)
    set.delete(member)
    if (set.size === 0) this.sets.delete(key)
    return had ? 1 : 0
  }

  async smembers(key) {
    const set = this.sets.get(key)
    if (!set) return []
    return Array.from(set)
  }

  // ── Hash Operations ────────────────────────────────────────────────────────

  async hset(key, field, value) {
    // Check if parent hash expired
    const hashExp = this.hashExpires.get(key)
    if (hashExp && Date.now() > hashExp) {
      this.hashes.delete(key)
      this.hashExpires.delete(key)
    }

    let hash = this.hashes.get(key)
    if (!hash) {
      hash = new Map()
      this.hashes.set(key, hash)
    }
    const exists = hash.has(field)
    hash.set(field, value)
    return exists ? 0 : 1
  }

  async hget(key, field) {
    const hashExp = this.hashExpires.get(key)
    if (hashExp && Date.now() > hashExp) {
      this.hashes.delete(key)
      this.hashExpires.delete(key)
      return null
    }

    const hash = this.hashes.get(key)
    if (!hash) return null
    return hash.get(field) || null
  }

  async hexists(key, field) {
    const val = await this.hget(key, field)
    return val !== null ? 1 : 0
  }

  async hdel(key, field) {
    const hash = this.hashes.get(key)
    if (!hash) return 0
    const deleted = hash.delete(field)
    if (hash.size === 0) {
      this.hashes.delete(key)
      this.hashExpires.delete(key)
    }
    return deleted ? 1 : 0
  }

  async hgetall(key) {
    const hashExp = this.hashExpires.get(key)
    if (hashExp && Date.now() > hashExp) {
      this.hashes.delete(key)
      this.hashExpires.delete(key)
      return {}
    }

    const hash = this.hashes.get(key)
    if (!hash) return {}

    const obj = {}
    for (const [f, v] of hash.entries()) {
      obj[f] = v
    }
    return obj
  }

  async hkeys(key) {
    const hashExp = this.hashExpires.get(key)
    if (hashExp && Date.now() > hashExp) {
      this.hashes.delete(key)
      this.hashExpires.delete(key)
      return []
    }

    const hash = this.hashes.get(key)
    if (!hash) return []
    return Array.from(hash.keys())
  }
}

export const memoryFallback = new MemoryFallbackStore()
export default memoryFallback
