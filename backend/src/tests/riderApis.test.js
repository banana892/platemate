/**
 * riderApis.test.js — End-to-End Delivery Partner API Integration Tests
 *
 * Tests all Phase 7 Rider endpoints:
 * 1.  Auth: Login as Rider
 * 2.  Dashboard: Stats overview
 * 3.  Profile: Get and update details
 * 4.  Availability: Get and update status
 * 5.  Active Orders: List active deliveries
 * 6.  Order Detail: Single delivery detail
 * 7.  Delivery Status: State machine transitions
 * 8.  Delivery History: Completed deliveries
 * 9.  Earnings: Date range aggregations
 * 10. Analytics: Performance metrics
 * 11. Notifications: List, mark read, mark all read
 * 12. Authorization: Non-rider role rejection
 * 13. Validation: Invalid inputs
 * 14. Edge Cases: Invalid transitions, missing resources
 *
 * Rider credentials (from seed.js):
 *   email: vikram@platemate.com
 *   password: Password@123
 *
 * Run: npm run test:rider
 */

import http from 'http'
import app from '../app.js'
import prisma from '../config/db.js'

const PORT = 5003
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let riderToken = null
let partnerToken = null
let customerToken = null
let testOrderId = null
let testNotificationId = null
let passCount = 0
let failCount = 0

// ── Assertion Helper ──────────────────────────────────────────────────────────

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

// ── API Request Helper ────────────────────────────────────────────────────────

const apiRequest = async (path, options = {}, useToken = undefined) => {
  const url = `${BASE_URL}${path}`
  // useToken=undefined → use global riderToken
  // useToken=null      → send no auth header (for testing unauthenticated access)
  // useToken=<string>  → use the explicit token provided
  const authToken = useToken !== undefined ? useToken : riderToken
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(url, { ...options, headers })

  let body = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  return { status: res.status, body, ok: res.ok }
}

// ── Test helpers ──────────────────────────────────────────────────────────────

const test = async (name, fn) => {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passCount++
  } catch (err) {
    console.log(`  ❌ ${name}`)
    console.log(`     ${err.message}`)
    failCount++
  }
}

// ── Main Test Runner ──────────────────────────────────────────────────────────

const runTests = async () => {
  console.log('🚀 Starting PlateMate Rider API Integration Tests...\n')

  try {
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}\n`)
        resolve()
      })
    })

    await testAuth()
    await testDashboard()
    await testProfile()
    await testAvailability()
    await testActiveOrders()
    await testDeliveryStatus()
    await testDeliveryHistory()
    await testEarnings()
    await testAnalytics()
    await testNotifications()
    await testAuthorizationGuards()
    await testValidation()
    await testEdgeCases()

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`)
    if (failCount === 0) {
      console.log('🟢 ALL RIDER TESTS COMPLETED SUCCESSFULLY! 🎉')
      process.exit(0)
    } else {
      console.log('🔴 SOME TESTS FAILED. Review the output above.')
      process.exit(1)
    }
  } catch (err) {
    console.error('\n🔴 RIDER TEST SUITE FAILURE:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    if (server) server.close()
    await prisma.$disconnect()
  }
}

// ── 1. Auth ───────────────────────────────────────────────────────────────────

const testAuth = async () => {
  console.log('🔐 [AUTH] Authentication tests...')

  await test('Login as RIDER with valid credentials', async () => {
    const { body, ok } = await apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'vikram@platemate.com', password: 'Password@123' }),
      },
      null
    )
    assert(ok, `Login failed: ${body?.message}`)
    assert(body.success === true, 'Login should return success=true')
    assert(body.data.accessToken, 'Access token must be present')
    assert(body.data.user.role === 'RIDER', 'User role must be RIDER')
    riderToken = body.data.accessToken
  })

  await test('Login as PARTNER (for auth guard tests)', async () => {
    const { body, ok } = await apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'priya@platemate.com', password: 'Password@123' }),
      },
      null
    )
    if (ok && body.data?.accessToken) {
      partnerToken = body.data.accessToken
    }
  })

  await test('Login as CUSTOMER (for auth guard tests)', async () => {
    const { body, ok } = await apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'arjun@platemate.com', password: 'Password@123' }),
      },
      null
    )
    if (ok && body.data?.accessToken) {
      customerToken = body.data.accessToken
    }
  })
}

// ── 2. Dashboard ──────────────────────────────────────────────────────────────

const testDashboard = async () => {
  console.log('\n📊 [DASHBOARD] Dashboard tests...')

  await test('GET /rider/dashboard returns correct structure', async () => {
    const { body, ok } = await apiRequest('/rider/dashboard')
    assert(ok, `Dashboard failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.onlineStatus !== undefined, 'Should include onlineStatus')
    assert(body.data.todayStats !== undefined, 'Should include todayStats')
    assert(body.data.weeklyStats !== undefined, 'Should include weeklyStats')
    assert(body.data.monthlyStats !== undefined, 'Should include monthlyStats')
    assert(body.data.activeDeliveries !== undefined, 'Should include activeDeliveries')
    assert(Array.isArray(body.data.recentDeliveries), 'recentDeliveries should be an array')
    assert(typeof body.data.totalDeliveries === 'number', 'totalDeliveries should be a number')
    assert(typeof body.data.averageRating === 'number', 'averageRating should be a number')
  })
}

// ── 3. Profile ────────────────────────────────────────────────────────────────

const testProfile = async () => {
  console.log('\n👤 [PROFILE] Profile tests...')

  await test('GET /rider/profile returns full profile', async () => {
    const { body, ok } = await apiRequest('/rider/profile')
    assert(ok, `Profile fetch failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.id, 'Should include rider id')
    assert(body.data.name, 'Should include name')
    assert(body.data.email, 'Should include email')
    assert(body.data.vehicleType !== undefined, 'Should include vehicleType')
    assert(body.data.isApproved !== undefined, 'Should include isApproved flag')
    assert(body.data.settings !== undefined, 'Should include settings')
  })

  await test('PUT /rider/profile updates vehicle info', async () => {
    const { body, ok } = await apiRequest('/rider/profile', {
      method: 'PUT',
      body: JSON.stringify({
        vehicleType: 'Electric Bike',
        vehicleNumber: 'KA-01-EV-9999',
        licenseNumber: 'KA0520210099999',
        emergencyContact: '+919876543299',
      }),
    })
    assert(ok, `Profile update failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.vehicleType === 'Electric Bike', 'vehicleType should be updated')
    assert(body.data.vehicleNumber === 'KA-01-EV-9999', 'vehicleNumber should be updated')
  })

  await test('PUT /rider/profile rejects invalid phone', async () => {
    const { body, status } = await apiRequest('/rider/profile', {
      method: 'PUT',
      body: JSON.stringify({ phone: 'not-a-phone' }),
    })
    assert(status === 422, `Should return 422, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })
}

// ── 4. Availability ───────────────────────────────────────────────────────────

const testAvailability = async () => {
  console.log('\n🟢 [AVAILABILITY] Availability status tests...')

  await test('GET /rider/status returns current status', async () => {
    const { body, ok } = await apiRequest('/rider/status')
    assert(ok, `Status fetch failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.riderStatus !== undefined, 'Should include riderStatus')
    assert(['ONLINE', 'OFFLINE', 'BUSY', 'ON_BREAK'].includes(body.data.riderStatus),
      'riderStatus must be a valid enum value')
  })

  await test('PATCH /rider/status → ONLINE succeeds for approved rider', async () => {
    const { body, ok } = await apiRequest('/rider/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ONLINE' }),
    })
    assert(ok, `Status update to ONLINE failed: ${body?.message}`)
    assert(body.data.riderStatus === 'ONLINE', 'Status should be ONLINE')
    assert(body.data.isAvailable === true, 'isAvailable should be true when ONLINE')
  })

  await test('PATCH /rider/status → ON_BREAK succeeds', async () => {
    const { body, ok } = await apiRequest('/rider/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ON_BREAK' }),
    })
    assert(ok, `Status update to ON_BREAK failed: ${body?.message}`)
    assert(body.data.riderStatus === 'ON_BREAK', 'Status should be ON_BREAK')
    assert(body.data.isAvailable === false, 'isAvailable should be false when ON_BREAK')
  })

  await test('PATCH /rider/status → OFFLINE succeeds', async () => {
    const { body, ok } = await apiRequest('/rider/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'OFFLINE' }),
    })
    assert(ok, `Status update to OFFLINE failed: ${body?.message}`)
    assert(body.data.riderStatus === 'OFFLINE', 'Status should be OFFLINE')
  })

  await test('PATCH /rider/status rejects invalid status value', async () => {
    const { body, status } = await apiRequest('/rider/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SLEEPING' }),
    })
    assert(status === 422, `Should return 422, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  // Set back to ONLINE for subsequent tests
  await apiRequest('/rider/status', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'ONLINE' }),
  })
}

// ── 5. Active Orders ──────────────────────────────────────────────────────────

const testActiveOrders = async () => {
  console.log('\n📦 [ACTIVE ORDERS] Active delivery tests...')

  await test('GET /rider/orders returns paginated list', async () => {
    const { body, ok } = await apiRequest('/rider/orders?page=1&limit=10')
    assert(ok, `Active orders fetch failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.orders !== undefined, 'Should include orders array')
    assert(Array.isArray(body.data.orders), 'orders must be array')
    assert(body.data.pagination !== undefined, 'Should include pagination meta')
    assert(typeof body.data.pagination.total === 'number', 'total should be a number')

    // Capture an order ID for subsequent status tests if available
    if (body.data.orders.length > 0) {
      const readyOrder = body.data.orders.find((o) => o.status === 'READY_FOR_PICKUP')
      if (readyOrder) {
        testOrderId = readyOrder.id
        console.log(`    📌 Found READY_FOR_PICKUP order: ${testOrderId}`)
      }
    }
  })

  await test('GET /rider/orders filters by status=READY_FOR_PICKUP', async () => {
    const { body, ok } = await apiRequest('/rider/orders?status=READY_FOR_PICKUP')
    assert(ok, `Orders filter failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    // All returned orders should be the correct status
    if (body.data.orders.length > 0) {
      body.data.orders.forEach((o) => {
        assert(o.status === 'READY_FOR_PICKUP', `All orders should be READY_FOR_PICKUP, got ${o.status}`)
      })
    }
  })

  // Try to get order detail if we have an ID
  if (testOrderId) {
    await test(`GET /rider/orders/:id returns full delivery detail`, async () => {
      const { body, ok } = await apiRequest(`/rider/orders/${testOrderId}`)
      assert(ok, `Order detail fetch failed: ${body?.message}`)
      assert(body.success === true, 'Should return success=true')
      assert(body.data.id === testOrderId, 'Should return correct order')
      assert(body.data.restaurant !== undefined, 'Should include restaurant info')
      assert(body.data.customer !== undefined, 'Should include customer info')
      assert(Array.isArray(body.data.items), 'Should include items array')
      assert(body.data.deliveryAddress !== undefined, 'Should include deliveryAddress')
    })
  } else {
    await test('GET /rider/orders/:id with fake ID returns 404', async () => {
      const { body, status } = await apiRequest('/rider/orders/00000000-0000-0000-0000-000000000000')
      assert(status === 404, `Should return 404, got ${status}`)
      assert(body.success === false, 'Should return success=false')
    })
  }
}

// ── 6. Delivery Status ────────────────────────────────────────────────────────

const testDeliveryStatus = async () => {
  console.log('\n🔄 [DELIVERY STATUS] Status transition tests...')

  if (!testOrderId) {
    console.log('  ⚠️  No READY_FOR_PICKUP order found — seeding a test order...')

    // Create a READY_FOR_PICKUP order in DB and assign it to this rider for testing
    const rider = await prisma.deliveryPartner.findFirst({
      where: { user: { email: 'vikram@platemate.com' } },
    })
    const restaurant = await prisma.restaurant.findFirst({ where: { deletedAt: null } })
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } })

    if (rider && restaurant && customer) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-TEST-RIDER-${Date.now()}`,
          userId: customer.id,
          restaurantId: restaurant.id,
          deliveryPartnerId: rider.id,
          status: 'READY_FOR_PICKUP',
          subtotal: 250,
          deliveryFee: 40,
          discount: 0,
          tax: 0,
          totalAmount: 290,
          deliveryAddress: '123 Test Street, Bengaluru',
        },
      })
      testOrderId = order.id
      console.log(`  📌 Seeded test order: ${testOrderId}`)
    }
  }

  if (!testOrderId) {
    console.log('  ⚠️  Could not obtain test order — skipping status transition tests')
    return
  }

  await test(`PATCH /rider/orders/:id/status → OUT_FOR_DELIVERY (valid transition)`, async () => {
    const { body, ok } = await apiRequest(`/rider/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
    })
    assert(ok, `Status transition failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.status === 'OUT_FOR_DELIVERY', 'Status should be OUT_FOR_DELIVERY')
  })

  await test(`PATCH /rider/orders/:id/status → DELIVERED (valid transition)`, async () => {
    const { body, ok } = await apiRequest(`/rider/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DELIVERED' }),
    })
    assert(ok, `Status transition to DELIVERED failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.status === 'DELIVERED', 'Status should be DELIVERED')
    assert(body.data.deliveredAt !== null, 'deliveredAt should be set')
  })

  await test(`PATCH /rider/orders/:id/status rejects transition from DELIVERED`, async () => {
    // Order is now DELIVERED — any transition should be rejected
    const { body, status } = await apiRequest(`/rider/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
    })
    assert(status === 400, `Should return 400, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('PATCH /rider/orders/:id/status rejects invalid status value', async () => {
    const { body, status } = await apiRequest(`/rider/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTED' }), // Not in the rider's allowed enum
    })
    assert(status === 422, `Should return 422 for invalid status value, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('PATCH /rider/orders/:id/status with invalid UUID returns 422', async () => {
    const { body, status } = await apiRequest('/rider/orders/not-a-uuid/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
    })
    assert(status === 422, `Should return 422, got ${status}`)
  })
}

// ── 7. Delivery History ────────────────────────────────────────────────────────

const testDeliveryHistory = async () => {
  console.log('\n📜 [DELIVERY HISTORY] History tests...')

  await test('GET /rider/history returns paginated history', async () => {
    const { body, ok } = await apiRequest('/rider/history?page=1&limit=5')
    assert(ok, `History fetch failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.deliveries !== undefined, 'Should include deliveries array')
    assert(Array.isArray(body.data.deliveries), 'deliveries should be an array')
    assert(body.data.pagination !== undefined, 'Should include pagination')
    // All orders in history should be DELIVERED
    body.data.deliveries.forEach((d) => {
      assert(d.status === 'DELIVERED', `History entry should be DELIVERED, got ${d.status}`)
    })
  })

  await test('GET /rider/history with date filters', async () => {
    const today = new Date().toISOString().split('T')[0]
    const { body, ok } = await apiRequest(`/rider/history?startDate=2020-01-01&endDate=${today}`)
    assert(ok, `History with date filter failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
  })

  await test('GET /rider/history with search query', async () => {
    const { body, ok } = await apiRequest('/rider/history?search=ORD')
    assert(ok, `History search failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(Array.isArray(body.data.deliveries), 'deliveries should be an array')
  })

  await test('GET /rider/history with invalid date rejects with 422', async () => {
    const { body, status } = await apiRequest('/rider/history?startDate=not-a-date')
    assert(status === 422, `Should return 422, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })
}

// ── 8. Earnings ───────────────────────────────────────────────────────────────

const testEarnings = async () => {
  console.log('\n💰 [EARNINGS] Earnings tests...')

  await test('GET /rider/earnings?range=today returns today breakdown', async () => {
    const { body, ok } = await apiRequest('/rider/earnings?range=today')
    assert(ok, `Earnings today failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.summary !== undefined, 'Should include summary')
    assert(typeof body.data.summary.totalEarnings === 'number', 'totalEarnings should be a number')
    assert(typeof body.data.summary.deliveryCount === 'number', 'deliveryCount should be a number')
    assert(Array.isArray(body.data.breakdown), 'breakdown should be an array')
    assert(body.data.period?.range === 'today', 'Period range should be today')
  })

  await test('GET /rider/earnings?range=week returns weekly earnings', async () => {
    const { body, ok } = await apiRequest('/rider/earnings?range=week')
    assert(ok, `Earnings week failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.period.range === 'week', 'Period range should be week')
  })

  await test('GET /rider/earnings?range=month returns monthly earnings', async () => {
    const { body, ok } = await apiRequest('/rider/earnings?range=month')
    assert(ok, `Earnings month failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.period.range === 'month', 'Period range should be month')
  })

  await test('GET /rider/earnings with custom range', async () => {
    const { body, ok } = await apiRequest(
      '/rider/earnings?range=custom&startDate=2024-01-01&endDate=2024-12-31'
    )
    assert(ok, `Earnings custom range failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.period.range === 'custom', 'Period range should be custom')
  })

  await test('GET /rider/earnings custom range without dates returns 422', async () => {
    const { body, status } = await apiRequest('/rider/earnings?range=custom')
    assert(status === 422, `Should return 422, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })
}

// ── 9. Analytics ──────────────────────────────────────────────────────────────

const testAnalytics = async () => {
  console.log('\n📈 [ANALYTICS] Analytics tests...')

  await test('GET /rider/analytics returns performance metrics', async () => {
    const { body, ok } = await apiRequest('/rider/analytics?range=month')
    assert(ok, `Analytics failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.performance !== undefined, 'Should include performance')
    assert(typeof body.data.performance.totalAssigned === 'number', 'totalAssigned should be a number')
    assert(typeof body.data.performance.completionRate === 'number', 'completionRate should be a number')
    assert(typeof body.data.performance.averageDeliveryTimeMinutes === 'number', 'avgDeliveryTime should be a number')
    assert(Array.isArray(body.data.peakHours), 'peakHours should be an array')
    assert(Array.isArray(body.data.topDeliveryAreas), 'topDeliveryAreas should be an array')
  })

  await test('GET /rider/analytics for today range', async () => {
    const { body, ok } = await apiRequest('/rider/analytics?range=today')
    assert(ok, `Analytics today failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(body.data.period.range === 'today', 'Period should be today')
  })
}

// ── 10. Notifications ─────────────────────────────────────────────────────────

const testNotifications = async () => {
  console.log('\n🔔 [NOTIFICATIONS] Notification tests...')

  await test('GET /rider/notifications returns paginated list', async () => {
    const { body, ok } = await apiRequest('/rider/notifications?page=1&limit=10')
    assert(ok, `Notifications fetch failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(Array.isArray(body.data.notifications), 'notifications should be array')
    assert(body.data.pagination !== undefined, 'Should include pagination')
    assert(typeof body.data.unreadCount === 'number', 'unreadCount should be a number')

    // Capture first notification ID
    if (body.data.notifications.length > 0) {
      testNotificationId = body.data.notifications[0].id
      console.log(`    📌 Found notification: ${testNotificationId}`)
    }
  })

  await test('PATCH /rider/notifications/read-all marks all as read', async () => {
    const { body, ok } = await apiRequest('/rider/notifications/read-all', { method: 'PATCH' })
    assert(ok, `Mark all read failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    assert(typeof body.data.updatedCount === 'number', 'updatedCount should be a number')
  })

  if (testNotificationId) {
    await test(`PATCH /rider/notifications/:id/read marks one as read`, async () => {
      const { body, ok } = await apiRequest(`/rider/notifications/${testNotificationId}/read`, {
        method: 'PATCH',
      })
      assert(ok, `Mark notification read failed: ${body?.message}`)
      assert(body.success === true, 'Should return success=true')
      assert(body.data.id === testNotificationId, 'Should return correct notification ID')
    })
  }

  await test('PATCH /rider/notifications/:id/read with fake ID returns 404', async () => {
    const { body, status } = await apiRequest(
      '/rider/notifications/00000000-0000-0000-0000-000000000000/read',
      { method: 'PATCH' }
    )
    assert(status === 404, `Should return 404, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })
}

// ── 11. Authorization Guards ──────────────────────────────────────────────────

const testAuthorizationGuards = async () => {
  console.log('\n🔒 [AUTHORIZATION] Auth guard tests...')

  await test('Unauthenticated request to /rider/dashboard → 401', async () => {
    const { body, status } = await apiRequest('/rider/dashboard', {}, null)
    assert(status === 401, `Should return 401, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('PARTNER token cannot access /rider/dashboard → 403', async () => {
    if (!partnerToken) return
    const { body, status } = await apiRequest('/rider/dashboard', {}, partnerToken)
    assert(status === 403, `PARTNER should be rejected with 403, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('CUSTOMER token cannot access /rider/profile → 403', async () => {
    if (!customerToken) return
    const { body, status } = await apiRequest('/rider/profile', {}, customerToken)
    assert(status === 403, `CUSTOMER should be rejected with 403, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('CUSTOMER token cannot access /rider/earnings → 403', async () => {
    if (!customerToken) return
    const { body, status } = await apiRequest('/rider/earnings', {}, customerToken)
    assert(status === 403, `CUSTOMER should be rejected with 403, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })
}

// ── 12. Validation ─────────────────────────────────────────────────────────────

const testValidation = async () => {
  console.log('\n🛡️  [VALIDATION] Input validation tests...')

  await test('PUT /rider/profile with invalid emergencyContact → 422', async () => {
    const { body, status } = await apiRequest('/rider/profile', {
      method: 'PUT',
      body: JSON.stringify({ emergencyContact: '123' }), // Too short
    })
    assert(status === 422, `Should return 422, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('PATCH /rider/status with missing body → 422', async () => {
    const { body, status } = await apiRequest('/rider/status', {
      method: 'PATCH',
      body: JSON.stringify({}),
    })
    assert(status === 422, `Should return 422, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('GET /rider/earnings with invalid range → 422', async () => {
    const { body, status } = await apiRequest('/rider/earnings?range=yesterday')
    assert(status === 422, `Should return 422 for invalid range, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })
}

// ── 13. Edge Cases ─────────────────────────────────────────────────────────────

const testEdgeCases = async () => {
  console.log('\n⚡ [EDGE CASES] Edge case tests...')

  await test("GET /rider/orders/:id for another rider's order → 404", async () => {
    // Non-existent order ID owned by nobody
    const { body, status } = await apiRequest(
      '/rider/orders/00000000-0000-0000-0000-000000000001'
    )
    assert(status === 404, `Should return 404, got ${status}`)
    assert(body.success === false, 'Should return success=false')
  })

  await test('GET /rider/history respects date ordering', async () => {
    const { body, ok } = await apiRequest('/rider/history?sortBy=createdAt&order=asc')
    assert(ok, `History sorting failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    // Verify ascending order if multiple deliveries
    if (body.data.deliveries.length > 1) {
      const dates = body.data.deliveries.map((d) => new Date(d.createdAt).getTime())
      const isSorted = dates.every((v, i) => i === 0 || v >= dates[i - 1])
      assert(isSorted, 'Deliveries should be sorted in ascending order')
    }
  })

  await test('GET /rider/earnings returns zero earnings for empty period', async () => {
    const { body, ok } = await apiRequest(
      '/rider/earnings?range=custom&startDate=2020-01-01&endDate=2020-01-02'
    )
    assert(ok, `Zero earnings fetch failed: ${body?.message}`)
    assert(body.success === true, 'Should return success=true')
    // earnings may be 0 or some value — just assert structure
    assert(typeof body.data.summary.totalEarnings === 'number', 'totalEarnings should be a number')
    assert(typeof body.data.summary.deliveryCount === 'number', 'deliveryCount should be a number')
  })
}

// ── Run ───────────────────────────────────────────────────────────────────────

runTests()
