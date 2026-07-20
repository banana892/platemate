/**
 * partnerApis.test.js — End-to-End Restaurant Partner API Integration Tests
 *
 * Runs a complete test suite covering all partner endpoints:
 * 1. Auth: Login as Partner
 * 2. Dashboard: Fetch statistics
 * 3. Profile: Get and update details
 * 4. Settings: Get and update operational settings
 * 5. Business Hours: Get and update timings
 * 6. Categories: CRUD operations and validation rules
 * 7. Menu Items: CRUD, availability toggling, soft deletes
 * 8. Restaurant Availability: Open/Close overrides
 * 9. Orders: List, details, status transitions, invalid status checks
 * 10. Analytics: Get revenue and popularity details
 * 11. Notifications: List and mark read
 */

import http from 'http'
import app from '../app.js'
import prisma from '../config/db.js'

const PORT = 5002
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let token = null
let testRestaurantId = null
let testCategoryId = null
let testMenuItemId = null
let testOrderId = null
let testNotificationId = null

const runTests = async () => {
  console.log('🚀 Starting PlateMate Restaurant Partner API Integration Tests...\n')

  try {
    // ── 1. Boot Server ────────────────────────────────────────────────────────
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}`)
        resolve()
      })
    })

    // ── 2. Authenticate (Login as Partner) ────────────────────────────────────
    await authenticatePartner()

    // Resolve restaurant ID from our middleware's default logic
    await resolveRestaurantId()

    // ── 3. Test Dashboard ─────────────────────────────────────────────────────
    await testDashboard()

    // ── 4. Test Profile & settings ───────────────────────────────────────────
    await testProfileAndSettings()

    // ── 5. Test Business Hours ────────────────────────────────────────────────
    await testBusinessHours()

    // ── 6. Test Categories CRUD ───────────────────────────────────────────────
    await testCategories()

    // ── 7. Test Menu Items CRUD ───────────────────────────────────────────────
    await testMenuItems()

    // ── 8. Test Restaurant Availability Toggles ──────────────────────────────
    await testRestaurantAvailability()

    // ── 9. Test Order Management & Status Transitions ────────────────────────
    await testOrderManagement()

    // ── 10. Test Analytics ────────────────────────────────────────────────────
    await testAnalytics()

    // ── 11. Test Notifications ────────────────────────────────────────────────
    await testNotifications()

    console.log('\n🟢 ALL PARTNER TESTS COMPLETED SUCCESSFULLY! 🎉')
    process.exit(0)
  } catch (err) {
    console.error('\n🔴 PARTNER TEST FAILURE:', err.message)
    if (err.response) {
      console.error('Response status:', err.response.status)
      console.error('Response body:', JSON.stringify(err.response.body, null, 2))
    } else {
      console.error(err)
    }
    process.exit(1)
  } finally {
    if (server) {
      server.close()
    }
    await prisma.$disconnect()
  }
}

// ── Assertion Helpers ────────────────────────────────────────────────────────

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

const apiRequest = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  let body = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const err = new Error(`HTTP Error ${res.status}: ${body?.message || res.statusText}`)
    err.response = { status: res.status, body }
    throw err
  }

  return { status: res.status, body }
}

// ── Test Flows ───────────────────────────────────────────────────────────────

const authenticatePartner = async () => {
  console.log('\n🔐 [AUTH] Logging in as Partner (priya@platemate.com)...')
  const { body } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'priya@platemate.com',
      password: 'Password@123',
    }),
  })

  assert(body.success === true, 'Login should be successful')
  assert(body.data.accessToken, 'Access token should be returned')
  token = body.data.accessToken
  console.log('✅ Authenticated successfully!')
}

const resolveRestaurantId = async () => {
  // Call profile to let middleware resolve restaurantId, returning the resolved restaurant details
  const { body } = await apiRequest('/partner/restaurant')
  testRestaurantId = body.data.id
  console.log(`💡 Resolved active restaurant: ${body.data.name} (${testRestaurantId})`)
}

const testDashboard = async () => {
  console.log('\n📊 [DASHBOARD] Fetching dashboard details...')
  const { body } = await apiRequest('/partner/dashboard')
  assert(body.success === true, 'Dashboard retrieval should succeed')
  assert(body.data.todayStats !== undefined, 'Should return todayStats')
  assert(body.data.ordersSummary !== undefined, 'Should return ordersSummary')
  assert(body.data.recentOrders !== undefined, 'Should return recentOrders')
  console.log('✅ Dashboard fetched successfully!')
}

const testProfileAndSettings = async () => {
  console.log('\n🏪 [PROFILE & SETTINGS] Testing profile/settings updates...')

  // 1. Update Profile
  const { body: profileBody } = await apiRequest('/partner/restaurant', {
    method: 'PUT',
    body: JSON.stringify({
      description: 'Updated test restaurant description',
      deliveryFee: 49.00,
    }),
  })
  assert(profileBody.success === true, 'Update profile should succeed')
  assert(profileBody.data.deliveryFee === 49, 'Delivery fee should update')
  console.log('✅ Profile updated successfully')

  // 2. Get settings (auto-initialized if not exists)
  const { body: settingsGet } = await apiRequest('/partner/settings')
  assert(settingsGet.success === true, 'Get settings should succeed')
  console.log('✅ Settings retrieved (auto-initialized successfully)')

  // 3. Update Settings
  const { body: settingsPut } = await apiRequest('/partner/settings', {
    method: 'PUT',
    body: JSON.stringify({
      autoAcceptOrders: true,
      restaurantAnnouncement: 'Welcome to our remodeled kitchen!',
      maxConcurrentOrders: 15,
    }),
  })
  assert(settingsPut.success === true, 'Update settings should succeed')
  assert(settingsPut.data.autoAcceptOrders === true, 'autoAcceptOrders should update')
  assert(settingsPut.data.maxConcurrentOrders === 15, 'maxConcurrentOrders should update')
  console.log('✅ Operational settings updated successfully')
}

const testBusinessHours = async () => {
  console.log('\n🕐 [BUSINESS HOURS] Testing business hours modifications...')

  const { body: getBody } = await apiRequest('/partner/business-hours')
  assert(getBody.success === true, 'Get business hours should succeed')
  assert(getBody.data.length > 0, 'Should return weekly timings')

  // Update today's hours
  const todayHour = getBody.data[0]
  const { body: putBody } = await apiRequest('/partner/business-hours', {
    method: 'PUT',
    body: JSON.stringify({
      businessHours: [
        {
          dayOfWeek: todayHour.dayOfWeek,
          openTime: '08:00',
          closeTime: '23:30',
          isClosed: false,
        },
      ],
    }),
  })
  assert(putBody.success === true, 'Update business hours should succeed')
  const updatedDay = putBody.data.find(bh => bh.dayOfWeek === todayHour.dayOfWeek)
  assert(updatedDay.openTime === '08:00', 'Open time should update')
  console.log('✅ Business hours updated successfully')
}

const testCategories = async () => {
  console.log('\n📂 [CATEGORIES] Testing categories CRUD operations...')

  // 1. Create category
  const { body: createBody } = await apiRequest('/partner/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Drinks Test',
      description: 'Refreshing beverages',
      sortOrder: 1,
    }),
  })
  assert(createBody.success === true, 'Create category should succeed')
  testCategoryId = createBody.data.id
  console.log(`✅ Created category: ${createBody.data.name} (${testCategoryId})`)

  // 2. List categories
  const { body: listBody } = await apiRequest('/partner/categories')
  assert(listBody.data.some(c => c.id === testCategoryId), 'Created category should be in list')
  console.log('✅ List categories verified')

  // 3. Update category
  const { body: updateBody } = await apiRequest(`/partner/categories/${testCategoryId}`, {
    method: 'PUT',
    body: JSON.stringify({
      description: 'Super refreshing beverages',
    }),
  })
  assert(updateBody.data.description === 'Super refreshing beverages', 'Description should update')
  console.log('✅ Updated category successfully')

  // 4. Delete Category (unpopulated)
  const { body: deleteBody } = await apiRequest(`/partner/categories/${testCategoryId}`, {
    method: 'DELETE',
  })
  assert(deleteBody.success === true, 'Delete category should succeed')
  console.log('✅ Deleted unpopulated category successfully')
}

const testMenuItems = async () => {
  console.log('\n🍛 [MENU ITEMS] Testing menu items operations & deletion constraints...')

  // 1. Create a category to hold the menu item
  const { body: catBody } = await apiRequest('/partner/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Burgers Test',
      description: 'Juicy burgers',
    }),
  })
  const tempCategoryId = catBody.data.id

  // 2. Create menu item
  const { body: createBody } = await apiRequest('/partner/menu-items', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Cheeseburger Test',
      description: 'Double cheese burger',
      price: 299.00,
      isVeg: false,
      isAvailable: true,
      categoryId: tempCategoryId,
    }),
  })
  assert(createBody.success === true, 'Create menu item should succeed')
  testMenuItemId = createBody.data.id
  console.log(`✅ Created menu item: ${createBody.data.name} (${testMenuItemId})`)

  // 3. Try to delete the category Burgers Test (should fail because it contains active items)
  console.log('💡 Attempting to delete populated category...')
  try {
    await apiRequest(`/partner/categories/${tempCategoryId}`, {
      method: 'DELETE',
    })
    throw new Error('Should have blocked category deletion')
  } catch (err) {
    assert(err.response?.status === 400, 'Populated category delete should return HTTP 400')
    assert(err.response?.body?.message.includes('containing menu items'), 'Should show items warning message')
    console.log('✅ Deletion correctly blocked!')
  }

  // 4. Toggle availability
  const { body: toggleBody } = await apiRequest(`/partner/menu-items/${testMenuItemId}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable: false }),
  })
  assert(toggleBody.data.isAvailable === false, 'Availability should update to false')
  console.log('✅ Toggled menu item availability successfully')

  // 5. Soft-delete menu item
  const { body: deleteBody } = await apiRequest(`/partner/menu-items/${testMenuItemId}`, {
    method: 'DELETE',
  })
  assert(deleteBody.success === true, 'Delete menu item should succeed')
  console.log('✅ Soft-deleted menu item successfully')

  // 6. Delete category (should succeed now that the item is deleted)
  const { body: catDeleteBody } = await apiRequest(`/partner/categories/${tempCategoryId}`, {
    method: 'DELETE',
  })
  assert(catDeleteBody.success === true, 'Delete category should now succeed')
  console.log('✅ Deleted category successfully after item soft-deletion')
}

const testRestaurantAvailability = async () => {
  console.log('\n🛑 [AVAILABILITY] Testing restaurant open/close availability overrides...')

  // 1. Close restaurant
  const { body: closeBody } = await apiRequest('/partner/restaurant/close', {
    method: 'PATCH',
    body: JSON.stringify({ reason: 'Kitchen renovation' }),
  })
  assert(closeBody.data.isTemporarilyClosed === true, 'Should be closed')
  assert(closeBody.data.temporaryClosureReason === 'Kitchen renovation', 'Reason should be stored')
  console.log('✅ Temporarily closed restaurant and set reason successfully')

  // 2. Open restaurant
  const { body: openBody } = await apiRequest('/partner/restaurant/open', {
    method: 'PATCH',
  })
  assert(openBody.data.isTemporarilyClosed === false, 'Should be open')
  console.log('✅ Re-opened restaurant successfully')
}

const testOrderManagement = async () => {
  console.log('\n📦 [ORDERS] Testing order listing & status transitions...')

  // Create a pending test order to guarantee status transitions are tested
  const customer = await prisma.user.findUnique({
    where: { email: 'arjun@platemate.com' },
  })
  const menuItem = await prisma.menuItem.findFirst({
    where: { restaurantId: testRestaurantId, deletedAt: null },
  })

  const testOrder = await prisma.order.create({
    data: {
      userId: customer.id,
      restaurantId: testRestaurantId,
      orderNumber: `PM-TEST-${Date.now()}`,
      status: 'PENDING',
      subtotal: 100,
      deliveryFee: 10,
      tax: 5,
      discount: 0,
      totalAmount: 115,
      deliveryAddress: '{"street": "123 Test St", "city": "Bengaluru"}',
      items: {
        create: {
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: 1,
          unitPrice: menuItem.price,
          totalPrice: menuItem.price,
        },
      },
    },
  })
  testOrderId = testOrder.id
  console.log(`💡 Created pending test order: ${testOrder.orderNumber} (${testOrderId})`)

  // 1. List orders
  const { body: listBody } = await apiRequest('/partner/orders')
  assert(listBody.success === true, 'List orders should succeed')
  assert(listBody.data.orders.length > 0, 'Should have orders')

  // 2. Retrieve details
  const { body: detailBody } = await apiRequest(`/partner/orders/${testOrderId}`)
  assert(detailBody.success === true, 'Get order details should succeed')
  assert(detailBody.data.id === testOrderId, 'ID should match')
  console.log('✅ Retrieved order details successfully')

  // 3. Test Invalid Transition (e.g. PENDING -> OUT_FOR_DELIVERY)
  console.log('💡 Testing invalid status transition block...')
  try {
    await apiRequest(`/partner/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
    })
    throw new Error('Should have blocked invalid transition')
  } catch (err) {
    assert(err.response?.status === 400, 'Invalid transition should return HTTP 400')
    console.log('✅ Invalid transition correctly blocked!')
  }

  // 4. Test Valid Transition (PENDING -> CONFIRMED)
  const { body: confirmBody } = await apiRequest(`/partner/orders/${testOrderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'CONFIRMED' }),
  })
  assert(confirmBody.data.status === 'CONFIRMED', 'Status should be CONFIRMED')
  console.log('✅ Successfully transitioned status from PENDING to CONFIRMED')
}

const testAnalytics = async () => {
  console.log('\n📈 [ANALYTICS] Testing analytics filtering...')
  const { body } = await apiRequest('/partner/analytics?range=today')
  assert(body.success === true, 'Analytics retrieval should succeed')
  assert(body.data.summary.revenue !== undefined, 'Revenue should exist')
  assert(body.data.popularItems !== undefined, 'Popular items list should exist')
  console.log('✅ Analytics retrieved successfully!')
}

const testNotifications = async () => {
  console.log('\n🔔 [NOTIFICATIONS] Testing notifications...')
  
  // 1. Get notifications
  const { body: listBody } = await apiRequest('/partner/notifications')
  assert(listBody.success === true, 'Get notifications should succeed')
  assert(listBody.data.notifications.length > 0, 'Should return notifications')
  testNotificationId = listBody.data.notifications[0].id
  console.log('✅ List notifications validated')

  // 2. Mark read
  const { body: readBody } = await apiRequest(`/partner/notifications/${testNotificationId}/read`, {
    method: 'PATCH',
  })
  assert(readBody.success === true, 'Mark notification read should succeed')
  console.log('✅ Marked notification as read successfully')
}

// ── Run execution ───────────────────────────────────────────────────────────
runTests()
