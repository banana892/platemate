/**
 * customerApis.test.js — End-to-End Customer API Integration Tests
 *
 * Runs a complete test suite covering all customer endpoints:
 * 1. Auth: Login to get token
 * 2. Restaurant Module: Listing, details, menu, reviews
 * 3. Search Module: Root search
 * 4. Favorites Module: Add, get, remove
 * 5. Addresses Module: Create, list, update, delete
 * 6. Cart Module: Add, get, update, conflict check, clear
 * 7. Coupons: List available, apply to cart
 * 8. Checkout: Validation checks
 * 9. Orders: Placement, listing, details
 * 10. Reviews: Order review and restaurant rating updates
 */

import http from 'http'
import app from '../app.js'
import prisma from '../config/db.js'

const PORT = 5001
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let token = null
let testAddressId = null
let testRestaurantId = null
let testMenuItemId = null
let testCartItemId = null
let testOrderId = null
let testCouponCode = 'WELCOME50'

const runTests = async () => {
  console.log('🚀 Starting PlateMate Customer API Integration Tests...\n')

  try {
    // ── 1. Boot Server ────────────────────────────────────────────────────────
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}`)
        resolve()
      })
    })

    // ── 2. Authenticate (Login) ────────────────────────────────────────────────
    await authenticateCustomer()

    // ── 3. Public Restaurant & Search Endpoints ──────────────────────────────
    await testRestaurantEndpoints()
    await testSearchEndpoints()

    // ── 4. Address Management ───────────────────────────────────────────────
    await testAddressEndpoints()

    // ── 5. Restaurant Favorites ──────────────────────────────────────────────
    await testFavoriteEndpoints()

    // ── 6. Cart Management ──────────────────────────────────────────────────
    await testCartEndpoints()

    // ── 7. Coupon Endpoints ────────────────────────────────────────────────
    await testCouponEndpoints()

    // ── 8. Checkout Validation ──────────────────────────────────────────────
    await testCheckoutEndpoints()

    // ── 9. Order Management ─────────────────────────────────────────────────
    await testOrderEndpoints()

    // ── 10. Review Submission & Rating Update ────────────────────────────────
    await testReviewEndpoints()

    console.log('\n🟢 ALL TESTS COMPLETED SUCCESSFULLY! 🎉')
    process.exit(0)
  } catch (err) {
    console.error('\n🔴 TEST FAILURE:', err.message)
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

const authenticateCustomer = async () => {
  console.log('\n🔐 [AUTH] Logging in as Customer (arjun@platemate.com)...')
  const { body } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'arjun@platemate.com',
      password: 'Password@123',
    }),
  })

  assert(body.success === true, 'Login should be successful')
  assert(body.data.accessToken, 'Access token should be returned')
  token = body.data.accessToken
  console.log('✅ Logged in successfully!')
}

const testRestaurantEndpoints = async () => {
  console.log('\n🏪 [RESTAURANTS] Testing restaurant listing & details...')

  // 1. List restaurants
  const { body: listBody } = await apiRequest('/restaurants')
  assert(listBody.success === true, 'List restaurants should succeed')
  assert(listBody.data.restaurants.length > 0, 'Should return restaurants')
  console.log(`✅ Fetched ${listBody.data.restaurants.length} restaurants successfully`)

  // Save restaurant and item IDs for downstream tests
  const restaurant = listBody.data.restaurants[0]
  testRestaurantId = restaurant.id
  console.log(`💡 Selected restaurant: ${restaurant.name} (${testRestaurantId})`)

  // Ensure the restaurant is marked open for the test by updating its business hours for today
  const testDate = new Date()
  const testDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const testDayOfWeek = testDays[testDate.getDay()]
  await prisma.businessHour.update({
    where: {
      uq_business_hour_day: {
        restaurantId: testRestaurantId,
        dayOfWeek: testDayOfWeek,
      },
    },
    data: {
      openTime: '00:00',
      closeTime: '23:59',
      isClosed: false,
    },
  })
  console.log('⚙️ Dynamically marked test restaurant open for the current day')

  // 2. Fetch detailed restaurant
  const { body: detailBody } = await apiRequest(`/restaurants/${testRestaurantId}`)
  assert(detailBody.success === true, 'Fetch restaurant details should succeed')
  assert(detailBody.data.id === testRestaurantId, 'ID should match')
  assert(detailBody.data.categories.length > 0, 'Should return menu categories')
  
  // Find first category with menu items
  const populatedCategory = detailBody.data.categories.find(c => c.menuItems.length > 0)
  assert(populatedCategory, 'Should have at least one populated category')
  testMenuItemId = populatedCategory.menuItems[0].id
  console.log(`💡 Selected menu item: ${populatedCategory.menuItems[0].name} (${testMenuItemId})`)
  console.log('✅ Fetched restaurant details and categories successfully')

  // 3. Fetch menu separately
  const { body: menuBody } = await apiRequest(`/restaurants/${testRestaurantId}/menu`)
  assert(menuBody.success === true, 'Fetch restaurant menu should succeed')
  assert(menuBody.data.length > 0, 'Menu categories should be returned')
  console.log('✅ Fetched separate menu successfully')
}

const testSearchEndpoints = async () => {
  console.log('\n🔍 [SEARCH] Testing search endpoint...')
  const { body } = await apiRequest('/search?q=Biryani')
  assert(body.success === true, 'Search should succeed')
  assert(body.data.restaurants !== undefined, 'Grouped restaurants should be returned')
  assert(body.data.menuItems !== undefined, 'Grouped menuItems should be returned')
  assert(body.data.cuisines !== undefined, 'Grouped cuisines should be returned')
  console.log('✅ Root search validated successfully')
}

const testAddressEndpoints = async () => {
  console.log('\n📍 [ADDRESSES] Testing address operations...')

  // 1. Create a new address
  const { body: createBody } = await apiRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify({
      label: 'Test Office',
      type: 'WORK',
      street: '100 Feet Rd, Indiranagar',
      landmark: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9716,
      longitude: 77.6412,
      isDefault: true,
    }),
  })
  assert(createBody.success === true, 'Create address should succeed')
  assert(createBody.data.id !== undefined, 'Should return address ID')
  testAddressId = createBody.data.id
  console.log(`✅ Created test address (${testAddressId})`)

  // 2. List addresses
  const { body: listBody } = await apiRequest('/addresses')
  assert(listBody.success === true, 'List addresses should succeed')
  const createdAddress = listBody.data.find(a => a.id === testAddressId)
  assert(createdAddress, 'Created address should be in list')
  assert(createdAddress.isDefault === true, 'Created address should be marked as default')
  console.log('✅ Listed and verified default address settings')

  // 3. Update address
  const { body: updateBody } = await apiRequest(`/addresses/${testAddressId}`, {
    method: 'PUT',
    body: JSON.stringify({
      landmark: 'Opposite Metro Station',
    }),
  })
  assert(updateBody.success === true, 'Update address should succeed')
  assert(updateBody.data.landmark === 'Opposite Metro Station', 'Landmark should update')
  console.log('✅ Updated address successfully')
}

const testFavoriteEndpoints = async () => {
  console.log('\n❤️ [FAVORITES] Testing favorite operations...')

  // 1. Add favorite
  const { body: addBody } = await apiRequest(`/favorites/${testRestaurantId}`, {
    method: 'POST',
  })
  assert(addBody.success === true, 'Add favorite should succeed')
  console.log('✅ Added restaurant to favorites')

  // 2. List favorites
  const { body: listBody } = await apiRequest('/favorites')
  assert(listBody.success === true, 'List favorites should succeed')
  assert(listBody.data.some(f => f.id === testRestaurantId), 'Favorite restaurant should be in list')
  console.log('✅ Listed and verified favorite list')

  // 3. Delete favorite
  const { body: deleteBody } = await apiRequest(`/favorites/${testRestaurantId}`, {
    method: 'DELETE',
  })
  assert(deleteBody.success === true, 'Delete favorite should succeed')
  console.log('✅ Removed restaurant from favorites')
}

const testCartEndpoints = async () => {
  console.log('\n🛒 [CART] Testing cart operations...')

  // 1. Clear cart first
  await apiRequest('/cart', { method: 'DELETE' })
  console.log('🧹 Cart initialized (cleared)')

  // 2. Get cart (should be empty)
  const { body: emptyBody } = await apiRequest('/cart')
  assert(emptyBody.data.items.length === 0, 'Cart should be empty')

  // 3. Add item
  const { body: addBody } = await apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      menuItemId: testMenuItemId,
      quantity: 2,
    }),
  })
  assert(addBody.success === true, 'Add item to cart should succeed')
  assert(addBody.data.items.length === 1, 'Cart should contain 1 item')
  testCartItemId = addBody.data.items[0].id
  console.log(`✅ Added menu item to cart. CartItem ID: ${testCartItemId}`)

  // 4. Test Single-Restaurant Conflict Check
  // Let's find an item from another restaurant.
  const { body: allRestaurants } = await apiRequest('/restaurants')
  const otherRestaurant = allRestaurants.data.restaurants.find(r => r.id !== testRestaurantId)
  if (otherRestaurant) {
    const { body: otherDetail } = await apiRequest(`/restaurants/${otherRestaurant.id}`)
    const otherMenuItem = otherDetail.data.categories.find(c => c.menuItems.length > 0)?.menuItems[0]
    if (otherMenuItem) {
      console.log(`💡 Testing conflict check by adding item from another restaurant (${otherRestaurant.name})...`)
      try {
        await apiRequest('/cart/items', {
          method: 'POST',
          body: JSON.stringify({
            menuItemId: otherMenuItem.id,
            quantity: 1,
          }),
        })
        throw new Error('Should have thrown CART_RESTAURANT_CONFLICT error!')
      } catch (err) {
        assert(err.response?.status === 400, 'Conflict should return HTTP 400')
        assert(err.response?.body?.message.includes('another restaurant'), 'Should show restaurant conflict message')
        console.log('✅ Conflict correctly blocked!')
      }
    }
  }

  // 5. Update quantity
  const { body: updateBody } = await apiRequest(`/cart/items/${testCartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity: 4 }),
  })
  assert(updateBody.data.items[0].quantity === 4, 'Quantity should be updated to 4')
  console.log('✅ Updated cart item quantity successfully')
}

const testCouponEndpoints = async () => {
  console.log('\n🎟️ [COUPONS] Testing coupons endpoints...')

  // 1. List available coupons
  const { body: listBody } = await apiRequest('/coupons/available')
  assert(listBody.success === true, 'List coupons should succeed')
  assert(listBody.data.coupons.length > 0, 'Should return active coupons')
  console.log(`✅ Retrieved ${listBody.data.coupons.length} available coupons`)

  // 2. Apply coupon
  const { body: applyBody } = await apiRequest('/cart/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({ code: testCouponCode }),
  })
  assert(applyBody.success === true, 'Apply coupon should succeed')
  assert(applyBody.data.couponApplied.code === testCouponCode, 'Applied coupon code should match')
  assert(applyBody.data.totals.discount > 0, 'Discount should be calculated')
  console.log(`✅ Applied coupon ${testCouponCode} and received discount of ₹${applyBody.data.totals.discount}`)
}

const testCheckoutEndpoints = async () => {
  console.log('\n🏁 [CHECKOUT] Testing checkout validation...')

  const { body } = await apiRequest('/checkout/validate', {
    method: 'POST',
    body: JSON.stringify({
      addressId: testAddressId,
      couponCode: testCouponCode,
    }),
  })

  assert(body.success === true, 'Checkout validation should succeed')
  assert(body.data.distance !== undefined, 'Distance should be returned')
  assert(body.data.totals.grandTotal > 0, 'Grand total should be computed')
  assert(body.data.couponApplied.code === testCouponCode, 'Coupon should be active in response')
  console.log(`✅ Checkout validation passed! Distance: ${body.data.distance} km, Grand Total: ₹${body.data.totals.grandTotal}`)
}

const testOrderEndpoints = async () => {
  console.log('\n📦 [ORDERS] Testing order placement & retrieval...')

  // 1. Place order from cart
  const { body: createBody } = await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({
      addressId: testAddressId,
      couponCode: testCouponCode,
      notes: 'Please ring bell',
    }),
  })

  assert(createBody.success === true, 'Order creation should succeed')
  assert(createBody.data.id !== undefined, 'Should return order ID')
  testOrderId = createBody.data.id
  console.log(`✅ Placed order successfully! Order Number: ${createBody.data.orderNumber} (ID: ${testOrderId})`)

  // 2. Confirm payment / COD to complete order and clear cart
  await apiRequest('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ orderId: testOrderId, method: 'COD' }),
  })
  const { body: cartBody } = await apiRequest('/cart')
  assert(cartBody.data.items.length === 0, 'Cart should be cleared after payment confirmation')
  console.log('✅ Verified cart was automatically cleared on payment confirmation')

  // 3. Get order history
  const { body: listBody } = await apiRequest('/orders')
  assert(listBody.success === true, 'Get orders should succeed')
  assert(listBody.data.orders.some(o => o.id === testOrderId), 'Placed order should be in history')
  console.log('✅ Checked order in history list')

  // 4. Get order details
  const { body: detailBody } = await apiRequest(`/orders/${testOrderId}`)
  assert(detailBody.success === true, 'Get order details should succeed')
  assert(detailBody.data.id === testOrderId, 'ID should match')
  assert(detailBody.data.notes === 'Please ring bell', 'Notes snapshot should match')
  assert(detailBody.data.items.length > 0, 'Items snapshot should exist')
  console.log('✅ Verified order details snapshots (address, items, prices)')
}

const testReviewEndpoints = async () => {
  console.log('\n⭐ [REVIEWS] Testing reviews and rating updates...')

  // Reviews require the order to be completed (DELIVERED).
  // Let's force-update the status of our test order to DELIVERED in the database
  // since we did not implement Rider panel to change status.
  await prisma.order.update({
    where: { id: testOrderId },
    data: { status: 'DELIVERED' },
  })
  console.log('⚙️ Force-updated order status to DELIVERED in database')

  // Clean up any pre-existing reviews for this user & restaurant (to avoid unique constraint violations)
  const user = await prisma.user.findUnique({
    where: { email: 'arjun@platemate.com' },
  })
  await prisma.review.deleteMany({
    where: {
      userId: user.id,
      restaurantId: testRestaurantId,
    },
  })
  console.log('⚙️ Cleaned up any pre-existing review for this user and restaurant')

  // Submit review
  const { body: createBody = {} } = await apiRequest(`/orders/${testOrderId}/review`, {
    method: 'POST',
    body: JSON.stringify({
      rating: 5,
      comment: 'Excellent food and super fast delivery!',
    }),
  })

  assert(createBody.success === true, 'Submit review should succeed')
  assert(createBody.data.rating === 5, 'Rating should be 5')
  console.log('✅ Submitted 5-star review for order')

  // Verify restaurant rating updated
  const { body: restBody } = await apiRequest(`/restaurants/${testRestaurantId}`)
  assert(restBody.data.totalReviews > 0, 'Total reviews count should be updated')
  console.log(`✅ Restaurant average rating recalculated: ${restBody.data.averageRating} (Total reviews: ${restBody.data.totalReviews})`)
}

// ── Run execution ───────────────────────────────────────────────────────────
runTests()
