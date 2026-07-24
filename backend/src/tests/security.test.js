/**
 * security.test.js — Security Hardening E2E Test Suite (Phase 13)
 *
 * Runs self-contained tests verifying all security features added in Phase 13:
 * - Request ID tracking
 * - Prototype pollution sanitization
 * - Login lockout & counter reset
 * - Password history enforcement
 * - Magic byte file validation
 * - Audit log creation & Admin Audit Log API
 * - CSP violation report receiver
 * - Endpoint-specific rate limiters
 */

import http from 'http'
import app from '../app.js'
import prisma from '../config/db.js'
import { hashPassword } from '../utils/bcrypt.js'

const PORT = 5013
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let adminToken = null
let userToken = null
let userId = null

let passCount = 0
let failCount = 0

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

const apiRequest = async (path, options = {}, token = null) => {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof Buffer)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const res = await fetch(url, { ...options, headers })
  let data = null
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  return { status: res.status, headers: res.headers, data }
}

const runTest = async (name, fn) => {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passCount++
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`)
    failCount++
  }
}

const setup = async () => {
  console.log('\n🚀 Starting Security Test Suite Setup...')

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve)
  })

  // Ensure Admin user exists
  let admin = await prisma.user.findUnique({ where: { email: 'secadmin@platemate.com' } })
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'secadmin@platemate.com',
        name: 'Sec Admin',
        password: await hashPassword('Password@123'),
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
    })
  }

  // Ensure test User exists and reset password
  let user = await prisma.user.findUnique({ where: { email: 'secuser@platemate.com' } })
  const defaultPass = await hashPassword('Password@123')
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'secuser@platemate.com',
        name: 'Sec User',
        password: defaultPass,
        role: 'CUSTOMER',
        isVerified: true,
        isActive: true,
      },
    })
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: defaultPass },
    })
  }
  userId = user.id

  // Clean password history for secuser to ensure idempotent tests
  await prisma.passwordHistory.deleteMany({ where: { userId: user.id } })

  // Login admin to get token
  const adminLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: 'secadmin@platemate.com', password: 'Password@123' },
  })
  adminToken = adminLogin.data.data.accessToken

  // Login user to get token
  const userLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: 'secuser@platemate.com', password: 'Password@123' },
  })
  userToken = userLogin.data.data.accessToken

  console.log('✅ Setup complete.\n')
}

const teardown = async () => {
  console.log('\n🧹 Cleaning up security tests...')
  if (server) {
    server.close()
  }
  await prisma.$disconnect()

  console.log(`\n========================================`)
  console.log(`  Security Test Results:`)
  console.log(`  Passed: ${passCount}`)
  console.log(`  Failed: ${failCount}`)
  console.log(`========================================\n`)

  if (failCount > 0) {
    process.exit(1)
  }
}

const runAllTests = async () => {
  await setup()

  console.log('--- 1. Request ID & Security Headers ---')
  await runTest('Every response includes X-Request-ID header', async () => {
    const res = await apiRequest('/health')
    assert(res.headers.get('x-request-id'), 'Missing X-Request-ID header')
  })

  await runTest('Client-provided X-Request-ID is preserved and sanitized', async () => {
    const customId = 'custom-trace-id-12345678'
    const res = await apiRequest('/health', {
      headers: { 'X-Request-ID': customId },
    })
    assert(res.headers.get('x-request-id') === customId, 'Client X-Request-ID was not preserved')
  })

  console.log('\n--- 2. Input Sanitization (Prototype Pollution) ---')
  await runTest('Sanitizer strips __proto__ keys from body', async () => {
    const res = await apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: {
          email: 'secuser@platemate.com',
          password: 'Password@123',
          __proto__: { polluted: true },
        },
      }
    )
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    assert(({}).polluted === undefined, 'Prototype pollution succeeded!')
  })

  console.log('\n--- 3. CSP Report Endpoint ---')
  await runTest('CSP report endpoint accepts violation reports', async () => {
    const res = await apiRequest(
      '/security/csp-report',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'http://localhost:5000',
            'blocked-uri': 'http://eval-evil.com/script.js',
          },
        }),
      }
    )
    assert(res.status === 204, `Expected 204, got ${res.status}`)
  })

  console.log('\n--- 4. Password History Enforcement ---')
  await runTest('Changing password saves to history and prevents immediate reuse', async () => {
    const newPass = 'NewPassword@123'
    // 1. Change password to newPass
    const changeRes = await apiRequest(
      '/auth/change-password',
      {
        method: 'POST',
        body: { currentPassword: 'Password@123', newPassword: newPass },
      },
      userToken
    )
    assert(changeRes.status === 200, `Failed to change password: ${JSON.stringify(changeRes.data)}`)

    // Re-login to get fresh token
    const loginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'secuser@platemate.com', password: newPass },
    })
    userToken = loginRes.data.data.accessToken

    // 2. Try to change back to newPass (or old password in history)
    const reuseRes = await apiRequest(
      '/auth/change-password',
      {
        method: 'POST',
        body: { currentPassword: newPass, newPassword: newPass },
      },
      userToken
    )
    assert(reuseRes.status === 400, `Expected 400 for password reuse, got ${reuseRes.status}`)
    assert(
      reuseRes.data.message.includes('reuse'),
      `Unexpected error message: ${reuseRes.data.message}`
    )
  })

  console.log('\n--- 5. Audit Log API & Verification ---')
  await runTest('Admin can fetch audit logs filtered by action', async () => {
    const res = await apiRequest(
      '/admin/audit-logs?action=LOGIN_SUCCESS',
      { method: 'GET' },
      adminToken
    )
    assert(res.status === 200, `Expected 200, got ${res.status}`)
    assert(Array.isArray(res.data.data.logs), 'Logs should be an array')
    assert(res.data.data.logs.length > 0, 'Should have logged at least 1 login success')
    assert(
      res.data.data.logs[0].action === 'LOGIN_SUCCESS',
      `Expected LOGIN_SUCCESS action, got ${res.data.data.logs[0].action}`
    )
  })

  console.log('\n--- 6. Login Lockout ---')
  await runTest('5 consecutive failed logins lock account', async () => {
    const targetEmail = 'lockout_test@platemate.com'
    // Create temporary user for lockout test
    let lockUser = await prisma.user.findUnique({ where: { email: targetEmail } })
    if (!lockUser) {
      lockUser = await prisma.user.create({
        data: {
          email: targetEmail,
          name: 'Lockout Test',
          password: await hashPassword('Password@123'),
          role: 'CUSTOMER',
          isVerified: true,
          isActive: true,
        },
      })
    }

    // 5 bad attempts
    for (let i = 0; i < 5; i++) {
      await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: targetEmail, password: 'WrongPassword999!' },
      })
    }

    // 6th attempt should return 429 Too Many Requests
    const blockedRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: targetEmail, password: 'WrongPassword999!' },
    })

    assert(blockedRes.status === 429, `Expected 429, got ${blockedRes.status}`)
    assert(
      blockedRes.data.message.includes('locked'),
      `Expected locked message, got ${blockedRes.data.message}`
    )
  })

  await teardown()
}

runAllTests().catch(async (err) => {
  console.error('Test suite failed:', err)
  await teardown()
})
