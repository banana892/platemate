/**
 * redis.test.js — Integration & Unit Tests for Redis Cache & Optimization Layer (Phase 11)
 *
 * Verifies memory fallback behaves identically, graceful failover proxies work,
 * and rate-limiters, blacklists, and presence heartbeats are fully operational.
 */

import './setup_env.js'
import assert from 'assert'
import memoryFallback from '../redis/memoryFallback.js'
import { setMockRedisAvailability } from '../redis/redis.client.js'
import {
  getCache,
  setCache,
  deleteCache,
  deletePattern,
  addPresence,
  removePresence,
  getOnlinePresence,
  blacklistToken,
  isTokenBlacklisted,
  checkRateLimit,
} from '../redis/redis.service.js'

let passCount = 0
let failCount = 0

const test = async (name, fn) => {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passCount++
  } catch (err) {
    console.log(`  ❌ ${name}`)
    console.log(`     ${err.stack}`)
    failCount++
  }
}

const runTests = async () => {
  console.log('🚀 Starting PlateMate Redis & Performance Optimization Tests...\n')

  // Always force mock availability to use memoryFallback during tests so it is environment-agnostic
  setMockRedisAvailability(false)

  // ── 1. Unit Tests for memoryFallback ───────────────────────────────────────
  console.log('📦 [MEMORY FALLBACK STORE] Verifying direct store commands...')

  await test('Set and Get basic string key-value pairs', async () => {
    await memoryFallback.set('test_key', 'hello_world')
    const val = await memoryFallback.get('test_key')
    assert.strictEqual(val, 'hello_world', 'Should retrieve correct string value')
  })

  await test('Set with EX expiration cleans up after duration', async () => {
    await memoryFallback.set('expire_key', 'short_live', 'EX', 1)
    const valBefore = await memoryFallback.get('expire_key')
    assert.strictEqual(valBefore, 'short_live', 'Should exist initially')

    // Wait 1.1s for expiration
    await new Promise((res) => setTimeout(res, 1100))
    const valAfter = await memoryFallback.get('expire_key')
    assert.strictEqual(valAfter, null, 'Should be null after expiration')
  })

  await test('Delete key removes it from the store', async () => {
    await memoryFallback.set('delete_key', 'to_be_deleted')
    const deleted = await memoryFallback.del('delete_key')
    assert.strictEqual(deleted, 1, 'Should return 1 (deleted count)')
    const val = await memoryFallback.get('delete_key')
    assert.strictEqual(val, null, 'Should return null after deletion')
  })

  await test('Increment operations modify values', async () => {
    await memoryFallback.del('counter')
    const val1 = await memoryFallback.incrby('counter', 1)
    assert.strictEqual(val1, 1, 'First increment should start at 1')

    const val2 = await memoryFallback.incrby('counter', 5)
    assert.strictEqual(val2, 6, 'Second increment should add 5 to equal 6')
  })

  await test('Hash operations (HSET, HGET, HEXISTS, HGETALL, HKEYS)', async () => {
    const key = 'test_hash'
    await memoryFallback.del(key)

    await memoryFallback.hset(key, 'field1', 'val1')
    await memoryFallback.hset(key, 'field2', 'val2')

    const f1 = await memoryFallback.hget(key, 'field1')
    assert.strictEqual(f1, 'val1')

    const exists = await memoryFallback.hexists(key, 'field1')
    assert.strictEqual(exists, 1)

    const nonexistent = await memoryFallback.hexists(key, 'field_fake')
    assert.strictEqual(nonexistent, 0)

    const all = await memoryFallback.hgetall(key)
    assert.deepStrictEqual(all, { field1: 'val1', field2: 'val2' })

    const keys = await memoryFallback.hkeys(key)
    assert.deepStrictEqual(keys.sort(), ['field1', 'field2'].sort())
  })

  await test('Set operations (SADD, SREM, SMEMBERS)', async () => {
    const key = 'test_set'
    await memoryFallback.del(key)

    await memoryFallback.sadd(key, 'memberA')
    await memoryFallback.sadd(key, 'memberB')

    const members = await memoryFallback.smembers(key)
    assert.deepStrictEqual(members.sort(), ['memberA', 'memberB'].sort())

    await memoryFallback.srem(key, 'memberA')
    const membersAfter = await memoryFallback.smembers(key)
    assert.deepStrictEqual(membersAfter, ['memberB'])
  })

  // ── 2. Cache-Aside and Pattern Deletion Tests ──────────────────────────────
  console.log('\n⚡ [CACHE ASIDE SERVICE] Verifying caching and selective invalidation...')

  await test('getCache and setCache handles JSON serialization', async () => {
    const key = 'cache:object:1'
    const obj = { id: 42, name: 'Samosa' }

    await setCache(key, obj, 10)
    const cached = await getCache(key)
    assert.deepStrictEqual(cached, obj, 'Should serialize and deserialize JSON correctly')
  })

  await test('deletePattern deletes keys matching glob patterns without KEYS command', async () => {
    await setCache('restaurant:1', { name: 'Restaurant 1' }, 10)
    await setCache('restaurant:1:menu', { items: [] }, 10)
    await setCache('restaurant:2', { name: 'Restaurant 2' }, 10)

    // Delete restaurant:1*
    await deletePattern('restaurant:1*')

    const r1 = await getCache('restaurant:1')
    const r1Menu = await getCache('restaurant:1:menu')
    const r2 = await getCache('restaurant:2')

    assert.strictEqual(r1, null, 'restaurant:1 should be deleted')
    assert.strictEqual(r1Menu, null, 'restaurant:1:menu should be deleted')
    assert.deepStrictEqual(r2, { name: 'Restaurant 2' }, 'restaurant:2 should remain intact')
  })

  // ── 3. Token Blacklist Tests ───────────────────────────────────────────────
  console.log('\n🔒 [TOKEN BLACKLIST] Verifying hashed token revocations...')

  await test('Blacklist token blocks check checks', async () => {
    const signature = 'test_signature_abc123'
    // Simulation: SHA256 hashed signature check
    const crypto = await import('crypto')
    const tokenIdentifier = crypto.default.createHash('sha256').update(signature).digest('hex')

    const before = await isTokenBlacklisted(tokenIdentifier)
    assert.strictEqual(before, false, 'Should not be blacklisted initially')

    await blacklistToken(tokenIdentifier, 2)
    const after = await isTokenBlacklisted(tokenIdentifier)
    assert.strictEqual(after, true, 'Should be blacklisted')

    // Wait 2.1s for blacklist entry expiration
    await new Promise((res) => setTimeout(res, 2100))
    const expired = await isTokenBlacklisted(tokenIdentifier)
    assert.strictEqual(expired, false, 'Should expire and clear from blacklist')
  })

  // ── 4. Rate Limiting Tests ──────────────────────────────────────────────────
  console.log('\n🚦 [RATE LIMITING] Verifying rate limit counting and window blocks...')

  await test('Rate limit checks pass within limits and fail when limit is exceeded', async () => {
    const key = 'login_attempt_ip123'
    await memoryFallback.del(`ratelimit:${key}`)

    // Limit 3 requests in a window of 5 seconds
    const r1 = await checkRateLimit(key, 3, 5)
    const r2 = await checkRateLimit(key, 3, 5)
    const r3 = await checkRateLimit(key, 3, 5)
    const r4 = await checkRateLimit(key, 3, 5)

    assert.strictEqual(r1, true, 'Req 1 allowed')
    assert.strictEqual(r2, true, 'Req 2 allowed')
    assert.strictEqual(r3, true, 'Req 3 allowed')
    assert.strictEqual(r4, false, 'Req 4 should be rate limited')
  })

  // ── 5. Real-Time Presence Hearts / Tracking ────────────────────────────────
  console.log('\n💓 [REALTIME PRESENCE] Verifying Redis heartbeat connection states...')

  await test('Presence tracking registers, heartbeats, and cleans up online IDs', async () => {
    const type = 'users'
    const id = 'user_99'
    const socketId = 'sock_abc123'

    // Add presence with short TTL
    await addPresence(type, id, socketId, 1)

    const list1 = await getOnlinePresence(type)
    assert.ok(list1.includes(id), 'User should be online')

    // Wait 1.1s for expiration
    await new Promise((res) => setTimeout(res, 1100))
    const list2 = await getOnlinePresence(type)
    assert.ok(!list2.includes(id), 'User should expire and automatically clean up')

    // Add back and explicitly remove
    await addPresence(type, id, socketId, 10)
    await removePresence(type, id)
    const list3 = await getOnlinePresence(type)
    assert.ok(!list3.includes(id), 'User should be clean after explicit logout/disconnect')
  })

  // ── Final Result Print ─────────────────────────────────────────────────────
  console.log(`\n🏁 Test Run Summary:`)
  console.log(`   Passed: ${passCount}`)
  console.log(`   Failed: ${failCount}`)

  if (failCount > 0) {
    process.exit(1)
  } else {
    console.log('✅ All Redis Optimization Tests Passed Successfully!')
    process.exit(0)
  }
}

runTests()
