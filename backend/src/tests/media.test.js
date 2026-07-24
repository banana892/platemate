/**
 * media.test.js — E2E Integration Tests for Media & File Management (Phase 12)
 */

import './setup_env.js'
import http from 'http'
import assert from 'assert'
import app from '../app.js'
import prisma from '../config/db.js'
import { setMockRedisAvailability } from '../redis/redis.client.js'

const PORT = 5007
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let customerToken = null
let partner1Token = null // Priya (owns Restaurant 1)
let partner2Token = null // Amit (owns Restaurant 2)
let customerId = null
let restaurant1Id = null
let restaurant2Id = null
let menuItemId = null // Belonging to Restaurant 1

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

const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Failed to login ${email}: ${body.message}`)
  }
  return { token: body.data.accessToken, userId: body.data.user.id }
}

const runTests = async () => {
  console.log('🚀 Starting PlateMate Media Upload & Cloudinary E2E Tests...\n')

  // Set mock cache availability
  setMockRedisAvailability(false)

  try {
    // 1. Boot HTTP Server
    await new Promise((resolve) => {
      server = http.createServer(app)
      server.listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}\n`)
        resolve()
      })
    })

    // 2. Logging in users
    console.log('🔐 Authenticating test users...')
    const customerLogin = await loginUser('arjun@platemate.com', 'Password@123')
    customerToken = customerLogin.token
    customerId = customerLogin.userId

    const partner1Login = await loginUser('priya@platemate.com', 'Password@123')
    partner1Token = partner1Login.token

    const partner2Login = await loginUser('rahul@platemate.com', 'Password@123')
    partner2Token = partner2Login.token

    // Fetch restaurants
    const r1 = await prisma.restaurant.findFirst({ where: { owner: { userId: partner1Login.userId } } })
    restaurant1Id = r1.id

    const r2 = await prisma.restaurant.findFirst({ where: { owner: { userId: partner2Login.userId } } })
    restaurant2Id = r2.id

    // Fetch a menu item from Restaurant 1
    const item = await prisma.menuItem.findFirst({ where: { restaurantId: restaurant1Id } })
    menuItemId = item.id

    console.log('Setup finished. Running tests...\n')

    // ── Test 1: Upload Profile Image ──────────────────────────────────────────
    console.log('👤 [USER PROFILE IMAGE] Updating customer profile avatars...')

    await test('PATCH /users/profile-image successfully updates avatar image reference', async () => {
      const formData = new FormData()
      const dummyFile = new Blob([Buffer.from('fake_image_bytes')], { type: 'image/png' })
      formData.append('image', dummyFile, 'avatar.png')

      const res = await fetch(`${BASE_URL}/users/profile-image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 200, 'Should return status 200')
      assert.ok(body.success, 'Response success should be true')
      assert.ok(body.data.imageUrl.includes('users/profile'), 'URL should contain correct folder name')
      assert.ok(body.data.publicId.startsWith('users/profile'), 'Public ID prefix mismatch')

      // Verify db changes
      const dbUser = await prisma.user.findUnique({ where: { id: customerId } })
      assert.strictEqual(dbUser.imageUrl, body.data.imageUrl)
      assert.strictEqual(dbUser.publicId, body.data.publicId)
      assert.strictEqual(dbUser.avatar, body.data.imageUrl)
    })

    // ── Test 2: Mime Format and Size Filters ───────────────────────────────────
    console.log('\n🛡️  [VALIDATIONS & FORMATS] Testing multer upload filters...')

    await test('Reject invalid MIME format uploads with 400 Bad Request', async () => {
      const formData = new FormData()
      const textFile = new Blob([Buffer.from('some text')], { type: 'text/plain' })
      formData.append('image', textFile, 'hello.txt')

      const res = await fetch(`${BASE_URL}/users/profile-image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 400, 'Should return status 400')
      assert.ok(body.message.includes('Allowed types are'), 'Error message mismatch')
    })

    await test('Reject oversized uploads (> 5 MB) with 400 Bad Request', async () => {
      const formData = new FormData()
      // Generate a buffer larger than 5 MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024)
      const largeFile = new Blob([largeBuffer], { type: 'image/jpeg' })
      formData.append('image', largeFile, 'huge.jpg')

      const res = await fetch(`${BASE_URL}/users/profile-image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 400, 'Should return status 400')
      assert.ok(body.message.includes('Maximum allowed size is 5 MB'), 'Error message mismatch')
    })

    // ── Test 3: Restaurant Logo and Banner Uploads ──────────────────────────────
    console.log('\n🏪 [RESTAURANT BRANDING] Updating logos and banners with ownership guards...')

    await test('PATCH /partner/restaurant/logo succeeds for valid owner', async () => {
      const formData = new FormData()
      const logoFile = new Blob([Buffer.from('logo_bytes')], { type: 'image/webp' })
      formData.append('image', logoFile, 'logo.webp')

      const res = await fetch(`${BASE_URL}/partner/restaurant/logo`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${partner1Token}`,
          'X-Restaurant-ID': restaurant1Id,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 200)
      assert.ok(body.data.imageUrl.includes('restaurants/logo'))

      const dbRest = await prisma.restaurant.findUnique({ where: { id: restaurant1Id } })
      assert.strictEqual(dbRest.imageUrl, body.data.imageUrl)
      assert.strictEqual(dbRest.publicId, body.data.publicId)
      assert.strictEqual(dbRest.image, body.data.imageUrl)
    })

    await test('PATCH /partner/restaurant/logo fails with 403 for unauthorized partner', async () => {
      const formData = new FormData()
      const logoFile = new Blob([Buffer.from('logo_bytes')], { type: 'image/png' })
      formData.append('image', logoFile, 'logo.png')

      const res = await fetch(`${BASE_URL}/partner/restaurant/logo`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${partner2Token}`, // Amit does not own Restaurant 1
          'X-Restaurant-ID': restaurant1Id,
        },
        body: formData,
      })

      assert.strictEqual(res.status, 403)
    })

    await test('PATCH /partner/restaurant/banner succeeds for valid owner', async () => {
      const formData = new FormData()
      const bannerFile = new Blob([Buffer.from('banner_bytes')], { type: 'image/jpeg' })
      formData.append('image', bannerFile, 'banner.jpg')

      const res = await fetch(`${BASE_URL}/partner/restaurant/banner`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${partner1Token}`,
          'X-Restaurant-ID': restaurant1Id,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 200)
      assert.ok(body.data.imageUrl.includes('restaurants/banner'))

      const dbRest = await prisma.restaurant.findUnique({ where: { id: restaurant1Id } })
      assert.strictEqual(dbRest.bannerUrl, body.data.imageUrl)
      assert.strictEqual(dbRest.bannerPublicId, body.data.publicId)
    })

    // ── Test 4: Menu Item Image Uploads ─────────────────────────────────────────
    console.log('\n🍛 [MENU ITEM IMAGES] Updating menu dishes images...')

    await test('PATCH /partner/menu/:id/image succeeds for valid owner', async () => {
      const formData = new FormData()
      const itemFile = new Blob([Buffer.from('dish_bytes')], { type: 'image/png' })
      formData.append('image', itemFile, 'dish.png')

      const res = await fetch(`${BASE_URL}/partner/menu/${menuItemId}/image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${partner1Token}`,
          'X-Restaurant-ID': restaurant1Id,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 200)
      assert.ok(body.data.imageUrl.includes('menu-items'))

      const dbItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } })
      assert.strictEqual(dbItem.imageUrl, body.data.imageUrl)
      assert.strictEqual(dbItem.publicId, body.data.publicId)
      assert.strictEqual(dbItem.image, body.data.imageUrl)
    })

    await test('PATCH /partner/menu/:id/image fails with 403 if partner tries to modify menu item of another restaurant', async () => {
      const formData = new FormData()
      const itemFile = new Blob([Buffer.from('dish_bytes')], { type: 'image/png' })
      formData.append('image', itemFile, 'dish.png')

      // Amit tries to modify Priya's menu item
      const res = await fetch(`${BASE_URL}/partner/menu/${menuItemId}/image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${partner2Token}`,
          'X-Restaurant-ID': restaurant2Id,
        },
        body: formData,
      })

      assert.strictEqual(res.status, 403)
    })

    // ── Test 5: General Media Upload and Deletion ────────────────────────────────
    console.log('\n📢 [GENERAL MEDIA MANAGEMENT] Testing upload and idempotent deletions...')

    let testPublicId = null

    await test('POST /media/upload uploads promo banner', async () => {
      const formData = new FormData()
      const bannerFile = new Blob([Buffer.from('promo_banner')], { type: 'image/jpeg' })
      formData.append('file', bannerFile, 'promo.jpg') // General uses 'file' field

      const res = await fetch(`${BASE_URL}/media/upload?folder=promo-banners`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: formData,
      })

      const body = await res.json()
      assert.strictEqual(res.status, 201)
      assert.ok(body.data.imageUrl.includes('promo-banners'))
      testPublicId = body.data.publicId
    })

    await test('DELETE /media/:publicId successfully removes asset references', async () => {
      // General delete route: /media/:publicId
      const res = await fetch(`${BASE_URL}/media/${testPublicId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      })

      assert.strictEqual(res.status, 200)
    })

    await test('DELETE /media/:publicId is idempotent on repeat deletion calls', async () => {
      const res = await fetch(`${BASE_URL}/media/${testPublicId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      })

      assert.strictEqual(res.status, 200, 'Should gracefully resolve 200 for missing Cloudinary public ID')
    })

    // ── Final Result Print ───────────────────────────────────────────────────
    console.log(`\n🏁 Test Run Summary:`)
    console.log(`   Passed: ${passCount}`)
    console.log(`   Failed: ${failCount}`)

    if (failCount > 0) {
      process.exit(1)
    } else {
      console.log('✅ All Media File Management E2E Tests Passed Successfully!')
      process.exit(0)
    }
  } catch (err) {
    console.error('Fatal Test Harness Error:', err)
    process.exit(1)
  } finally {
    if (server) {
      server.close()
    }
  }
}

runTests()
