/**
 * userDeletion.test.js — Integration & Unit Verification for Account Deletion
 */

import http from 'http'
import app from '../app.js'
import prisma from '../config/db.js'
import { hashPassword } from '../utils/bcrypt.js'

const PORT = 5002
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let testUserToken = null
let testUserId = null
let testUserEmail = `testdel_${Date.now()}@example.com`
let testUserPassword = 'TestPassword123!'

let googleUserToken = null
let googleUserId = null
let googleUserEmail = `google_del_${Date.now()}@example.com`

let adminToken = null
let adminUserId = null
let adminEmail = `admin_del_${Date.now()}@example.com`

const runTests = async () => {
  console.log('🚀 Starting Account Deletion Test Suite...\n')

  try {
    // 1. Start test HTTP server
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}`)
        resolve()
      })
    })

    // 2. Setup test data
    await setupTestData()

    // 3. Test invalid confirmations and wrong password
    await testValidationErrors()

    // 4. Test admin deletion protection
    await testAdminDeletionProtection()

    // 5. Test normal account deletion
    await testNormalAccountDeletion()

    // 6. Test Google OAuth account deletion
    await testGoogleAccountDeletion()

    console.log('\n🟢 ALL ACCOUNT DELETION TESTS PASSED SUCCESSFULLY! 🎉')
    process.exit(0)
  } catch (err) {
    console.error('\n🔴 TEST FAILURE:', err.message)
    if (err.response) {
      console.error('Response status:', err.response.status)
      console.error('Response body:', JSON.stringify(err.response.body, null, 2))
    }
    process.exit(1)
  } finally {
    if (server) {
      server.close()
    }
    await prisma.$disconnect()
  }
}

const setupTestData = async () => {
  console.log('  Setting up test users...')

  // Register Normal User
  const hashed = await hashPassword(testUserPassword)
  const user = await prisma.user.create({
    data: {
      name: 'Deletion Tester',
      email: testUserEmail,
      password: hashed,
      role: 'CUSTOMER',
      isVerified: true,
    },
  })
  testUserId = user.id

  // Create address, favorite, notification, order for user
  await prisma.address.create({
    data: {
      userId: user.id,
      label: 'Home',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      latitude: 19.076,
      longitude: 72.8777,
    },
  })

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SYSTEM',
      title: 'Welcome',
      message: 'Welcome to PlateMate!',
    },
  })

  // Login normal user to get token
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: testUserPassword },
  })
  testUserToken = res.body.data.accessToken

  // Register Google OAuth User
  const gUser = await prisma.user.create({
    data: {
      name: 'Google User',
      email: googleUserEmail,
      password: await hashPassword('dummy_google_pass'),
      role: 'CUSTOMER',
      isVerified: true,
    },
  })
  googleUserId = gUser.id

  const gRes = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: googleUserEmail, password: 'dummy_google_pass' },
  })
  googleUserToken = gRes.body.data.accessToken

  // Register Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Tester',
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  adminUserId = admin.id

  const adminRes = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: testUserPassword },
  })
  adminToken = adminRes.body.data.accessToken
}

const testValidationErrors = async () => {
  console.log('  Testing validation errors (confirmation mismatch, wrong password)...')

  // 1. Invalid confirmation
  const res1 = await apiRequest('/users/me', {
    method: 'DELETE',
    token: testUserToken,
    body: { confirmation: 'WRONG_TEXT', password: testUserPassword },
  })
  if (res1.status !== 400) {
    throw new Error(`Expected status 400 for wrong confirmation text, got ${res1.status}`)
  }

  // 2. Wrong password
  const res2 = await apiRequest('/users/me', {
    method: 'DELETE',
    token: testUserToken,
    body: { confirmation: 'DELETE', password: 'WrongPassword999!' },
  })
  if (res2.status !== 401) {
    throw new Error(`Expected status 401 for wrong password, got ${res2.status}`)
  }
}

const testAdminDeletionProtection = async () => {
  console.log('  Testing admin account deletion protection...')

  const res = await apiRequest('/users/me', {
    method: 'DELETE',
    token: adminToken,
    body: { confirmation: 'DELETE', password: testUserPassword },
  })

  if (res.status !== 403) {
    throw new Error(`Expected status 403 for admin account deletion, got ${res.status}`)
  }
}

const testNormalAccountDeletion = async () => {
  console.log('  Testing normal account deletion...')

  // Call DELETE /users/me
  const res = await apiRequest('/users/me', {
    method: 'DELETE',
    token: testUserToken,
    body: { confirmation: 'DELETE', password: testUserPassword },
  })

  if (res.status !== 200 || !res.body.success) {
    throw new Error(`Account deletion failed with status ${res.status}: ${JSON.stringify(res.body)}`)
  }

  // Verify user is soft-deleted in DB
  const dbUser = await prisma.user.findUnique({ where: { id: testUserId } })
  if (!dbUser || !dbUser.deletedAt || dbUser.isActive) {
    throw new Error('User record was not properly soft-deleted in database.')
  }

  // Verify addresses and notifications are deleted
  const addrCount = await prisma.address.count({ where: { userId: testUserId } })
  const notifCount = await prisma.notification.count({ where: { userId: testUserId } })

  if (addrCount !== 0 || notifCount !== 0) {
    throw new Error('Peripheral data (addresses/notifications) was not purged.')
  }

  // Attempt login with deleted account
  const loginRes = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: testUserPassword },
  })

  if (loginRes.status !== 401) {
    throw new Error(`Expected 401 when logging into soft-deleted account, got ${loginRes.status}`)
  }
}

const testGoogleAccountDeletion = async () => {
  console.log('  Testing Google OAuth account deletion...')

  // Delete using email confirmation
  const res = await apiRequest('/users/me', {
    method: 'DELETE',
    token: googleUserToken,
    body: { confirmation: googleUserEmail },
  })

  if (res.status !== 200 || !res.body.success) {
    throw new Error(`Google account deletion failed with status ${res.status}: ${JSON.stringify(res.body)}`)
  }

  const dbUser = await prisma.user.findUnique({ where: { id: googleUserId } })
  if (!dbUser || !dbUser.deletedAt || dbUser.isActive) {
    throw new Error('Google User record was not properly soft-deleted in database.')
  }
}

const apiRequest = (path, { method = 'GET', body, token } = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`)
    const payload = body ? JSON.stringify(body) : null

    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload)
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let responseData = ''
        res.on('data', (chunk) => {
          responseData += chunk
        })
        res.on('end', () => {
          let parsed = null
          try {
            parsed = JSON.parse(responseData)
          } catch (_) {}
          resolve({ status: res.statusCode, body: parsed || responseData })
        })
      }
    )

    req.on('error', reject)
    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

runTests()
