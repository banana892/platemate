/**
 * adminApis.test.js — End-to-End Admin API Integration Tests
 *
 * Tests all Phase 8 Admin endpoints.
 *
 * Admin credentials:
 *   email: admin@platemate.com
 *   password: Password@123
 */

import http from 'http'
import app from '../app.js'
import prisma from '../config/db.js'

const PORT = 5004
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let adminToken = null
let customerToken = null
let testCustomerId = null
let testRestaurantId = null
let testRiderId = null
let testOrderId = null
let testReviewId = null
let testCouponId = null
let testCuisineId = null

let passCount = 0
let failCount = 0

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

const apiRequest = async (path, options = {}, useToken = undefined) => {
  const url = `${BASE_URL}${path}`
  const token = useToken !== undefined ? useToken : adminToken
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

const runTests = async () => {
  console.log('🚀 Starting PlateMate Admin API Integration Tests...\n')

  try {
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}\n`)
        resolve()
      })
    })

    // Setup: Login and seed any necessary test data if needed
    await testAuth()
    await testDashboard()
    await testCustomerManagement()
    await testRestaurantManagement()
    await testRiderManagement()
    await testOrderManagement()
    await testReviewModeration()
    await testCouponManagement()
    await testCategoryManagement()
    await testAnalytics()
    await testNotifications()
    await testPlatformSettings()
    await testAuthorization()
    await testValidation()
    await testEdgeCases()

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`)
    if (failCount === 0) {
      console.log('🟢 ALL ADMIN TESTS COMPLETED SUCCESSFULLY! 🎉')
      process.exit(0)
    } else {
      console.log('🔴 SOME TESTS FAILED. Review the output above.')
      process.exit(1)
    }
  } catch (err) {
    console.error('\n🔴 ADMIN TEST SUITE FAILURE:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    if (server) server.close()
    await prisma.$disconnect()
  }
}

// ── 1. Auth ───────────────────────────────────────────────────────────────────

const testAuth = async () => {
  console.log('🔐 [AUTH] Logging in...')

  await test('Login as ADMIN with valid credentials', async () => {
    const { body, ok } = await apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@platemate.com', password: 'Password@123' }),
      },
      null
    )
    assert(ok, `Login failed: ${body?.message}`)
    assert(body.data.user.role === 'ADMIN', 'User role must be ADMIN')
    adminToken = body.data.accessToken
  })

  await test('Login as CUSTOMER (for auth guard checks)', async () => {
    const { body, ok } = await apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'arjun@platemate.com', password: 'Password@123' }),
      },
      null
    )
    if (ok) {
      customerToken = body.data.accessToken
    }
  })
}

// ── 2. Dashboard ──────────────────────────────────────────────────────────────

const testDashboard = async () => {
  console.log('\n📊 [DASHBOARD] Fetching dashboard details...')

  await test('GET /admin/dashboard returns valid structure', async () => {
    const { body, ok } = await apiRequest('/admin/dashboard')
    assert(ok, `Fetch dashboard failed: ${body?.message}`)
    assert(body.data.users !== undefined, 'Should return users count')
    assert(body.data.orders !== undefined, 'Should return orders summary')
    assert(body.data.revenue !== undefined, 'Should return revenue today/month')
    assert(body.data.pendingApprovals !== undefined, 'Should return pendingApprovals counts')
    assert(Array.isArray(body.data.topRestaurants), 'topRestaurants should be array')
  })
}

// ── 3. Customer Management ───────────────────────────────────────────────────

const testCustomerManagement = async () => {
  console.log('\n👥 [CUSTOMER MANAGEMENT] Listing and status updates...')

  await test('GET /admin/customers retrieves list', async () => {
    const { body, ok } = await apiRequest('/admin/customers?role=CUSTOMER')
    assert(ok, `Fetch list failed: ${body?.message}`)
    assert(Array.isArray(body.data.customers), 'customers should be array')
    if (body.data.customers.length > 0) {
      testCustomerId = body.data.customers[0].id
    }
  })

  if (testCustomerId) {
    await test('GET /admin/customers/:id returns details', async () => {
      const { body, ok } = await apiRequest(`/admin/customers/${testCustomerId}`)
      assert(ok, `Fetch details failed: ${body?.message}`)
      assert(body.data.id === testCustomerId, 'ID mismatch')
      assert(Array.isArray(body.data.addresses), 'addresses should be present')
    })

    await test('PATCH /admin/customers/:id/status → suspend works', async () => {
      const { body, ok } = await apiRequest(`/admin/customers/${testCustomerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'suspend' }),
      })
      assert(ok, `Suspend status update failed: ${body?.message}`)
      assert(body.data.isActive === false, 'isActive should be false after suspension')
    })

    await test('PATCH /admin/customers/:id/status → activate works', async () => {
      const { body, ok } = await apiRequest(`/admin/customers/${testCustomerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'activate' }),
      })
      assert(ok, `Activate status update failed: ${body?.message}`)
      assert(body.data.isActive === true, 'isActive should be true after activation')
    })
  }
}

// ── 4. Restaurant Management ─────────────────────────────────────────────────

const testRestaurantManagement = async () => {
  console.log('\n🏪 [RESTAURANT MANAGEMENT] Restaurant operations...')

  await test('GET /admin/restaurants retrieves list', async () => {
    const { body, ok } = await apiRequest('/admin/restaurants')
    assert(ok, `Fetch restaurants failed: ${body?.message}`)
    assert(Array.isArray(body.data.restaurants), 'restaurants must be array')
    if (body.data.restaurants.length > 0) {
      testRestaurantId = body.data.restaurants[0].id
    }
  })

  if (testRestaurantId) {
    await test('GET /admin/restaurants/:id returns details', async () => {
      const { body, ok } = await apiRequest(`/admin/restaurants/${testRestaurantId}`)
      assert(ok, `Fetch restaurant details failed: ${body?.message}`)
      assert(body.data.id === testRestaurantId, 'ID mismatch')
    })

    await test('PATCH /admin/restaurants/:id/approve updates owner approval', async () => {
      const { body, ok } = await apiRequest(`/admin/restaurants/${testRestaurantId}/approve`, {
        method: 'PATCH',
      })
      assert(ok, `Approve restaurant failed: ${body?.message}`)
      assert(body.data.isApproved === true, 'isApproved should be true')
    })

    await test('PATCH /admin/restaurants/:id/suspend deactivates restaurant', async () => {
      const { body, ok } = await apiRequest(`/admin/restaurants/${testRestaurantId}/suspend`, {
        method: 'PATCH',
      })
      assert(ok, `Suspend restaurant failed: ${body?.message}`)
      assert(body.data.isActive === false, 'isActive should be false')
    })

    await test('PATCH /admin/restaurants/:id/activate activates restaurant', async () => {
      const { body, ok } = await apiRequest(`/admin/restaurants/${testRestaurantId}/activate`, {
        method: 'PATCH',
      })
      assert(ok, `Activate restaurant failed: ${body?.message}`)
      assert(body.data.isActive === true, 'isActive should be true')
    })
  }
}

// ── 5. Rider Management ──────────────────────────────────────────────────────

const testRiderManagement = async () => {
  console.log('\n🏍️  [RIDER MANAGEMENT] Rider operations...')

  await test('GET /admin/riders retrieves list', async () => {
    const { body, ok } = await apiRequest('/admin/riders')
    assert(ok, `Fetch riders failed: ${body?.message}`)
    assert(Array.isArray(body.data.riders), 'riders must be array')
    if (body.data.riders.length > 0) {
      testRiderId = body.data.riders[0].id
    }
  })

  if (testRiderId) {
    await test('GET /admin/riders/:id returns details', async () => {
      const { body, ok } = await apiRequest(`/admin/riders/${testRiderId}`)
      assert(ok, `Fetch rider details failed: ${body?.message}`)
      assert(body.data.id === testRiderId, 'ID mismatch')
    })

    await test('PATCH /admin/riders/:id/approve updates rider approval', async () => {
      const { body, ok } = await apiRequest(`/admin/riders/${testRiderId}/approve`, {
        method: 'PATCH',
      })
      assert(ok, `Approve rider failed: ${body?.message}`)
      assert(body.data.isApproved === true, 'isApproved should be true')
    })

    await test('PATCH /admin/riders/:id/suspend deactivates rider user account', async () => {
      const { body, ok } = await apiRequest(`/admin/riders/${testRiderId}/suspend`, {
        method: 'PATCH',
      })
      assert(ok, `Suspend rider failed: ${body?.message}`)
      assert(body.data.isActive === false, 'isActive should be false')
    })

    await test('PATCH /admin/riders/:id/activate activates rider user account', async () => {
      const { body, ok } = await apiRequest(`/admin/riders/${testRiderId}/activate`, {
        method: 'PATCH',
      })
      assert(ok, `Activate rider failed: ${body?.message}`)
      assert(body.data.isActive === true, 'isActive should be true')
    })
  }
}

// ── 6. Order Management ──────────────────────────────────────────────────────

const testOrderManagement = async () => {
  console.log('\n📦 [ORDER MANAGEMENT] Admin order controls...')

  await test('GET /admin/orders retrieves list', async () => {
    const { body, ok } = await apiRequest('/admin/orders')
    assert(ok, `Fetch orders failed: ${body?.message}`)
    assert(Array.isArray(body.data.orders), 'orders must be array')
    const cancellableOrder = body.data.orders.find(o => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status))
    if (cancellableOrder) {
      testOrderId = cancellableOrder.id
    }
  })

  if (!testOrderId) {
    // Seed an order for testing
    const restaurant = await prisma.restaurant.findFirst({ where: { deletedAt: null } })
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } })
    if (restaurant && customer) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-ADM-${Date.now()}`,
          userId: customer.id,
          restaurantId: restaurant.id,
          status: 'PENDING',
          subtotal: 100,
          deliveryFee: 30,
          totalAmount: 130,
          deliveryAddress: 'Test Location',
        },
      })
      testOrderId = order.id
    }
  }

  if (testOrderId) {
    await test('GET /admin/orders/:id returns details', async () => {
      const { body, ok } = await apiRequest(`/admin/orders/${testOrderId}`)
      assert(ok, `Fetch order details failed: ${body?.message}`)
      assert(body.data.id === testOrderId, 'ID mismatch')
    })

    await test('PATCH /admin/orders/:id/cancel cancels order with reason', async () => {
      const { body, ok } = await apiRequest(`/admin/orders/${testOrderId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: 'Admin cancelled order for delivery issues' }),
      })
      assert(ok, `Cancel order failed: ${body?.message}`)
      assert(body.data.status === 'CANCELLED', 'status should be CANCELLED')
      assert(body.data.cancellationReason === 'Admin cancelled order for delivery issues', 'Reason mismatch')
    })
  }
}

// ── 7. Review Moderation ─────────────────────────────────────────────────────

const testReviewModeration = async () => {
  console.log('\n💬 [REVIEW MODERATION] Moderation checks...')

  await test('GET /admin/reviews retrieves list', async () => {
    const { body, ok } = await apiRequest('/admin/reviews')
    assert(ok, `Fetch reviews failed: ${body?.message}`)
    assert(Array.isArray(body.data.reviews), 'reviews should be array')
    if (body.data.reviews.length > 0) {
      testReviewId = body.data.reviews[0].id
    }
  })

  if (!testReviewId) {
    // Seed review
    const restaurant = await prisma.restaurant.findFirst({ where: { deletedAt: null } })
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } })
    // Seed order first because reviews are tied to orders
    if (restaurant && customer) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-REV-${Date.now()}`,
          userId: customer.id,
          restaurantId: restaurant.id,
          status: 'DELIVERED',
          subtotal: 100,
          deliveryFee: 30,
          totalAmount: 130,
          deliveryAddress: 'Test Location',
        },
      })
      const review = await prisma.review.create({
        data: {
          userId: customer.id,
          restaurantId: restaurant.id,
          orderId: order.id,
          rating: 5,
          comment: 'Good food',
        },
      })
      testReviewId = review.id
    }
  }

  if (testReviewId) {
    await test('PATCH /admin/reviews/:id/hide hides review', async () => {
      const { body, ok } = await apiRequest(`/admin/reviews/${testReviewId}/hide`, {
        method: 'PATCH',
      })
      assert(ok, `Hide review failed: ${body?.message}`)
      assert(body.data.isHidden === true, 'isHidden should be true')
    })

    await test('PATCH /admin/reviews/:id/restore restores review', async () => {
      const { body, ok } = await apiRequest(`/admin/reviews/${testReviewId}/restore`, {
        method: 'PATCH',
      })
      assert(ok, `Restore review failed: ${body?.message}`)
      assert(body.data.isHidden === false, 'isHidden should be false')
    })
  }
}

// ── 8. Coupon Management ─────────────────────────────────────────────────────

const testCouponManagement = async () => {
  console.log('\n🎟️  [COUPON MANAGEMENT] CRUD operations...')

  await test('POST /admin/coupons creates new coupon', async () => {
    const couponCode = `SAVE${Date.now().toString().slice(-4)}`
    const validFrom = new Date()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7)

    const { body, ok } = await apiRequest('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: couponCode,
        description: 'New coupon',
        discountPercent: 15,
        minimumOrder: 200,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        isActive: true,
      }),
    })

    assert(ok, `Create coupon failed: ${body?.message}`)
    assert(body.data.code === couponCode, 'Code mismatch')
    testCouponId = body.data.id
  })

  if (testCouponId) {
    await test('GET /admin/coupons retrieves coupons list', async () => {
      const { body, ok } = await apiRequest('/admin/coupons')
      assert(ok, `List coupons failed: ${body?.message}`)
      assert(body.data.coupons.length > 0, 'Should not be empty')
    })

    await test('GET /admin/coupons/:id returns details', async () => {
      const { body, ok } = await apiRequest(`/admin/coupons/${testCouponId}`)
      assert(ok, `Get coupon failed: ${body?.message}`)
      assert(body.data.id === testCouponId, 'ID mismatch')
    })

    await test('PUT /admin/coupons/:id updates details', async () => {
      const { body, ok } = await apiRequest(`/admin/coupons/${testCouponId}`, {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated coupon desc',
          minimumOrder: 300,
        }),
      })
      assert(ok, `Update coupon failed: ${body?.message}`)
      assert(body.data.description === 'Updated coupon desc', 'Description mismatch')
      assert(body.data.minimumOrder === 300, 'minimumOrder mismatch')
    })

    await test('DELETE /admin/coupons/:id deletes coupon', async () => {
      const { body, ok } = await apiRequest(`/admin/coupons/${testCouponId}`, {
        method: 'DELETE',
      })
      assert(ok, `Delete coupon failed: ${body?.message}`)
      assert(body.data.deleted === true, 'deleted should be true')
    })
  }
}

// ── 9. Category (Cuisine) Management ────────────────────────────────────────

const testCategoryManagement = async () => {
  console.log('\n📂 [CATEGORY MANAGEMENT] Global cuisines CRUD...')

  await test('POST /admin/cuisines creates new global category', async () => {
    const cuisineName = `Cuisine_${Date.now()}`
    const { body, ok } = await apiRequest('/admin/cuisines', {
      method: 'POST',
      body: JSON.stringify({
        name: cuisineName,
        image: 'https://example.com/cuisine.jpg',
      }),
    })
    assert(ok, `Create category failed: ${body?.message}`)
    assert(body.data.name === cuisineName, 'Name mismatch')
    testCuisineId = body.data.id
  })

  if (testCuisineId) {
    await test('GET /admin/cuisines lists all', async () => {
      const { body, ok } = await apiRequest('/admin/cuisines')
      assert(ok, `List categories failed: ${body?.message}`)
      assert(body.data.length > 0, 'Cuisines should not be empty')
    })

    await test('PUT /admin/cuisines/:id updates details', async () => {
      const updateName = `Cuisine_Upd_${Date.now()}`
      const { body, ok } = await apiRequest(`/admin/cuisines/${testCuisineId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updateName,
        }),
      })
      assert(ok, `Update category failed: ${body?.message}`)
      assert(body.data.name === updateName, 'Name mismatch')
    })

    await test('DELETE /admin/cuisines/:id deletes category', async () => {
      const { body, ok } = await apiRequest(`/admin/cuisines/${testCuisineId}`, {
        method: 'DELETE',
      })
      assert(ok, `Delete category failed: ${body?.message}`)
      assert(body.data.deleted === true, 'deleted should be true')
    })
  }
}

// ── 10. Analytics ────────────────────────────────────────────────────────────

const testAnalytics = async () => {
  console.log('\n📈 [ANALYTICS] Stats filters...')

  await test('GET /admin/analytics returns valid metrics structure', async () => {
    const { body, ok } = await apiRequest('/admin/analytics?range=month')
    assert(ok, `Fetch analytics failed: ${body?.message}`)
    assert(body.data.performance !== undefined, 'Should include performance metrics')
    assert(Array.isArray(body.data.topCities), 'topCities must be array')
    assert(Array.isArray(body.data.topRestaurants), 'topRestaurants must be array')
    assert(Array.isArray(body.data.topCustomers), 'topCustomers must be array')
  })
}

// ── 11. Notifications ────────────────────────────────────────────────────────

const testNotifications = async () => {
  console.log('\n🔔 [NOTIFICATIONS] Broadcast alerts...')

  await test('POST /admin/notifications broadcasts a system message', async () => {
    const { body, ok } = await apiRequest('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Platform Maintenance Alert',
        message: 'Platform settings are undergoing minor system upgrades.',
        type: 'SYSTEM',
        target: 'ALL',
      }),
    })
    assert(ok, `Broadcast failed: ${body?.message}`)
    assert(typeof body.data.broadcastCount === 'number', 'broadcastCount must be a number')
  })

  await test('GET /admin/notifications returns admin notifications', async () => {
    const { body, ok } = await apiRequest('/admin/notifications')
    assert(ok, `Fetch notifications failed: ${body?.message}`)
    assert(Array.isArray(body.data.notifications), 'notifications should be array')
  })
}

// ── 12. Platform Settings ────────────────────────────────────────────────────

const testPlatformSettings = async () => {
  console.log('\n⚙️  [PLATFORM SETTINGS] Config read/writes...')

  await test('GET /admin/settings returns current configuration', async () => {
    const { body, ok } = await apiRequest('/admin/settings')
    assert(ok, `Fetch settings failed: ${body?.message}`)
    assert(body.data.platformName !== undefined, 'platformName should be defined')
    assert(typeof body.data.platformFeePercent === 'number', 'platformFeePercent should be a number')
    assert(typeof body.data.defaultDeliveryFee === 'number', 'defaultDeliveryFee should be a number')
  })

  await test('PATCH /admin/settings updates settings configuration', async () => {
    const { body, ok } = await apiRequest('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        platformName: 'PlateMate Pro',
        platformFeePercent: 6.5,
        defaultDeliveryFee: 40,
        maintenanceMode: false,
      }),
    })
    assert(ok, `Update settings failed: ${body?.message}`)
    assert(body.data.platformName === 'PlateMate Pro', 'platformName mismatch')
    assert(body.data.platformFeePercent === 6.5, 'platformFeePercent mismatch')
    assert(body.data.defaultDeliveryFee === 40, 'defaultDeliveryFee mismatch')
  })
}

// ── 13. Authorization Guards ─────────────────────────────────────────────────

const testAuthorization = async () => {
  console.log('\n🔒 [AUTHORIZATION] Restricting access to non-admin roles...')

  await test('Request with CUSTOMER token returns 403 on dashboard', async () => {
    if (!customerToken) return
    const { body, status } = await apiRequest('/admin/dashboard', {}, customerToken)
    assert(status === 403, `Should get 403, got ${status}`)
    assert(body.success === false, 'Should be success=false')
  })

  await test('Unauthenticated request to settings returns 401', async () => {
    const { body, status } = await apiRequest('/admin/settings', {}, null)
    assert(status === 401, `Should get 401, got ${status}`)
    assert(body.success === false, 'Should be success=false')
  })
}

// ── 14. Validation ────────────────────────────────────────────────────────────

const testValidation = async () => {
  console.log('\n🛡️  [VALIDATION] Parameter formats and body payloads...')

  await test('POST /admin/coupons with invalid body parameters returns 422', async () => {
    const { status } = await apiRequest('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({ code: 'SP' }), // Too short code
    })
    assert(status === 422, `Should get 422, got ${status}`)
  })

  await test('PATCH /admin/settings with invalid email format returns 422', async () => {
    const { status } = await apiRequest('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ supportEmail: 'not-valid-email' }),
    })
    assert(status === 422, `Should get 422, got ${status}`)
  })
}

// ── 15. Edge Cases ───────────────────────────────────────────────────────────

const testEdgeCases = async () => {
  console.log('\n⚡ [EDGE CASES] Business rules and constraint guards...')

  await test('PATCH /admin/customers/:adminId/status to suspend an admin returns 403', async () => {
    // Find active admin ID
    const activeAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null } })
    if (activeAdmin) {
      const { status } = await apiRequest(`/admin/customers/${activeAdmin.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'suspend' }),
      })
      assert(status === 403, `Should get 403, got ${status}`)
    }
  })

  await test('DELETE /admin/cuisines/:id for in-use global category returns 400', async () => {
    // Find a cuisine linked to a restaurant
    const junction = await prisma.restaurantCuisine.findFirst()
    if (junction) {
      const { status } = await apiRequest(`/admin/cuisines/${junction.cuisineId}`, {
        method: 'DELETE',
      })
      assert(status === 400, `Should get 400, got ${status}`)
    }
  })
}

runTests()
