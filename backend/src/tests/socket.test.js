/**
 * socket.test.js — Integration tests for Socket.io Real-Time Layer (Phase 9)
 *
 * Verifies handshake authentication, room joins, notifications, and presence states.
 */

import http from 'http'
import { io as Client } from 'socket.io-client'
import app from '../app.js'
import prisma from '../config/db.js'
import { initSocket } from '../socket/socket.server.js'
import { presence } from '../socket/socket.handlers.js'
import { createOrder } from '../services/order.service.js'
import { updateOrderStatus } from '../services/partner.service.js'
import { updateDeliveryStatus } from '../services/rider.service.js'
import { broadcastNotification } from '../services/admin.service.js'

const PORT = 5005
const BASE_URL = `http://localhost:${PORT}/api/v1`

let server
let ioServer
let tokens = {
  customer: null,
  partner: null,
  rider: null,
  admin: null,
}
let ids = {
  customerUserId: null,
  partnerUserId: null,
  riderUserId: null,
  adminUserId: null,
  restaurantId: null,
  riderPartnerId: null,
}

let passCount = 0
let failCount = 0

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
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
    throw new Error(`Failed to login: ${body.message}`)
  }
  return { token: body.data.accessToken, userId: body.data.user.id }
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
  console.log('🚀 Starting PlateMate Socket.io Real-Time API Integration Tests...\n')

  try {
    // 1. Boot server
    await new Promise((resolve) => {
      server = http.createServer(app)
      ioServer = initSocket(server)
      server.listen(PORT, () => {
        console.log(`📡 Test HTTP & Socket server listening on port ${PORT}\n`)
        resolve()
      })
    })

    // 2. Fetch logins for roles
    console.log('🔐 Logging in test roles...')
    const customerLogin = await loginUser('arjun@platemate.com', 'Password@123')
    tokens.customer = customerLogin.token
    ids.customerUserId = customerLogin.userId

    const partnerLogin = await loginUser('priya@platemate.com', 'Password@123')
    tokens.partner = partnerLogin.token
    ids.partnerUserId = partnerLogin.userId

    const riderLogin = await loginUser('vikram@platemate.com', 'Password@123')
    tokens.rider = riderLogin.token
    ids.riderUserId = riderLogin.userId

    const adminLogin = await loginUser('admin@platemate.com', 'Password@123')
    tokens.admin = adminLogin.token
    ids.adminUserId = adminLogin.userId

    // Retrieve database relationships for room assertion
    const restOwner = await prisma.restaurantOwner.findUnique({
      where: { userId: ids.partnerUserId },
      include: { restaurants: { select: { id: true } } },
    })
    ids.restaurantId = restOwner?.restaurants[0]?.id

    const riderPartner = await prisma.deliveryPartner.findUnique({
      where: { userId: ids.riderUserId },
      select: { id: true },
    })
    ids.riderPartnerId = riderPartner?.id

    console.log('Setup complete. Running test suite...\n')

    // Run test categories
    await testAuth()
    await testPresenceAndRooms()
    await testOrderPlacementAndTracking()
    await testBroadcasting()

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`)
    if (failCount === 0) {
      console.log('🟢 ALL SOCKET TESTS COMPLETED SUCCESSFULLY! 🎉')
      process.exit(0)
    } else {
      console.log('🔴 SOME TESTS FAILED.')
      process.exit(1)
    }
  } catch (err) {
    console.error('\n🔴 SOCKET TEST SUITE FAILURE:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    if (ioServer) ioServer.close()
    if (server) server.close()
    await prisma.$disconnect()
  }
}

// ── 1. Authentication ──────────────────────────────────────────────────────────

const testAuth = async () => {
  console.log('🔒 [AUTHENTICATION] Handshake connection checks...')

  await test('Socket connection succeeds with valid customer JWT', async () => {
    const client = Client(`http://localhost:${PORT}`, {
      auth: { token: tokens.customer },
    })

    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        client.disconnect()
        resolve()
      })
      client.on('connect_error', (err) => {
        client.disconnect()
        reject(err)
      })
    })
  })

  await test('Socket connection is rejected with invalid JWT token', async () => {
    const client = Client(`http://localhost:${PORT}`, {
      auth: { token: 'invalid-token-here' },
    })

    const err = await new Promise((resolve) => {
      client.on('connect_error', (error) => {
        client.disconnect()
        resolve(error)
      })
    })
    assert(err.message.includes('Authentication error'), 'Should return auth error message')
  })
}

// ── 2. Presence & Rooms ──────────────────────────────────────────────────────

const testPresenceAndRooms = async () => {
  console.log('\n🟢 [PRESENCE & ROOMS] Active connection monitoring...')

  await test('Presence maps increment and rooms join automatically', async () => {
    const clientPartner = Client(`http://localhost:${PORT}`, { auth: { token: tokens.partner } })
    const clientRider = Client(`http://localhost:${PORT}`, { auth: { token: tokens.rider } })

    await Promise.all([
      new Promise((res) => clientPartner.on('connect', res)),
      new Promise((res) => clientRider.on('connect', res)),
    ])

    // Wait for server-side async DB queries in connection handler to complete
    await new Promise((res) => setTimeout(res, 200))

    // Assert presence maps updated
    assert(presence.onlineUsers.has(ids.partnerUserId), 'Partner userId should be in onlineUsers')
    assert(presence.onlineUsers.has(ids.riderUserId), 'Rider userId should be in onlineUsers')
    assert(presence.onlineRestaurants.has(ids.restaurantId), 'RestaurantId should be in onlineRestaurants')
    assert(presence.onlineRiders.has(ids.riderPartnerId), 'RiderId should be in onlineRiders')

    // Disconnect clients and check clean up
    const partnerDisconnect = new Promise((res) => clientPartner.on('disconnect', res))
    const riderDisconnect = new Promise((res) => clientRider.on('disconnect', res))

    clientPartner.disconnect()
    clientRider.disconnect()

    await Promise.all([partnerDisconnect, riderDisconnect])

    // Wait 300ms for the server event loop to receive the disconnect packets and clean up
    await new Promise((resolve) => setTimeout(resolve, 300))

    assert(!presence.onlineUsers.has(ids.partnerUserId), 'Partner should be cleaned up from presence maps')
    assert(!presence.onlineUsers.has(ids.riderUserId), 'Rider should be cleaned up from presence maps')
  })
}

// ── 3. Order Lifecycle Events ────────────────────────────────────────────────

const testOrderPlacementAndTracking = async () => {
  console.log('\n📦 [ORDER TRACKING] Order status event propagation...')

  await test('Events emit correctly to restaurant on customer checkout, prepare, and delivery', async () => {
    const clientCustomer = Client(`http://localhost:${PORT}`, { auth: { token: tokens.customer } })
    const clientRestaurant = Client(`http://localhost:${PORT}`, { auth: { token: tokens.partner } })
    const clientRider = Client(`http://localhost:${PORT}`, { auth: { token: tokens.rider } })

    await Promise.all([
      new Promise((res) => clientCustomer.on('connect', res)),
      new Promise((res) => clientRestaurant.on('connect', res)),
      new Promise((res) => clientRider.on('connect', res)),
    ])

    // 1. Order Creation Event verification
    // Seed checkout state items in cart first
    const address = await prisma.address.findFirst({ where: { userId: ids.customerUserId } })
    const cart = await prisma.cart.findUnique({ where: { userId: ids.customerUserId } })
    if (address && cart) {
      const socketPromise = new Promise((resolve) => {
        clientRestaurant.on('restaurant:new-order', (data) => {
          resolve(data)
        })
      })

      // Trigger checkout REST action directly
      const order = await createOrder(ids.customerUserId, { addressId: address.id })

      const eventData = await socketPromise
      assert(eventData.orderNumber === order.orderNumber, 'Order number mismatch on restaurant notice')

      // 2. Order status update: PENDING -> CONFIRMED
      const confirmPromise = new Promise((resolve) => {
        clientCustomer.on('order:updated', (data) => {
          resolve(data)
        })
      })

      await updateOrderStatus(ids.restaurantId, order.id, 'CONFIRMED')
      const confirmNotice = await confirmPromise
      assert(confirmNotice.status === 'CONFIRMED', 'Status should be CONFIRMED')

      // Assign rider to order to test ready assignment
      await prisma.order.update({
        where: { id: order.id },
        data: { deliveryPartnerId: ids.riderPartnerId },
      })

      // 3. READY_FOR_PICKUP status assignment notice to rider
      const assignmentPromise = new Promise((resolve) => {
        clientRider.on('rider:new-assignment', (data) => {
          resolve(data)
        })
      })

      // Go PREPARING -> READY_FOR_PICKUP
      await updateOrderStatus(ids.restaurantId, order.id, 'PREPARING')
      await updateOrderStatus(ids.restaurantId, order.id, 'READY_FOR_PICKUP')

      const assignmentNotice = await assignmentPromise
      assert(assignmentNotice.status === 'READY_FOR_PICKUP', 'Rider assignment check')

      // 4. Rider picks up OUT_FOR_DELIVERY status update
      const pickupPromise = new Promise((resolve) => {
        clientCustomer.on('order:updated', (data) => {
          resolve(data)
        })
      })

      await updateDeliveryStatus(ids.riderUserId, order.id, 'OUT_FOR_DELIVERY')
      const pickupNotice = await pickupPromise
      assert(pickupNotice.status === 'OUT_FOR_DELIVERY', 'Pickup customer notice status')
    }

    clientCustomer.disconnect()
    clientRestaurant.disconnect()
    clientRider.disconnect()
  })
}

// ── 4. Broadcast Notifications ────────────────────────────────────────────────

const testBroadcasting = async () => {
  console.log('\n🔔 [BROADCASTING] Global system broadcast alerts...')

  await test('Broadcast event propagates to online customer, rider, and admin sockets', async () => {
    const clientCustomer = Client(`http://localhost:${PORT}`, { auth: { token: tokens.customer } })
    const clientRider = Client(`http://localhost:${PORT}`, { auth: { token: tokens.rider } })
    const clientAdmin = Client(`http://localhost:${PORT}`, { auth: { token: tokens.admin } })

    await Promise.all([
      new Promise((res) => clientCustomer.on('connect', res)),
      new Promise((res) => clientRider.on('connect', res)),
      new Promise((res) => clientAdmin.on('connect', res)),
    ])

    const customerNoticePromise = new Promise((resolve) => {
      clientCustomer.on('notification:new', (data) => resolve(data))
    })
    const riderNoticePromise = new Promise((resolve) => {
      clientRider.on('rider:notification', (data) => resolve(data))
    })
    const adminNoticePromise = new Promise((resolve) => {
      clientAdmin.on('admin:notification', (data) => resolve(data))
    })

    // Dispatch broadcast action directly via admin service
    await broadcastNotification({
      title: 'Alert title',
      message: 'Alert message body',
      type: 'SYSTEM',
      target: 'ALL',
    })

    const customerNotice = await customerNoticePromise
    assert(customerNotice.title === 'Alert title', 'Customer notification title mismatch')

    const riderNotice = await riderNoticePromise
    assert(riderNotice.title === 'Alert title', 'Rider notification title mismatch')

    const adminNotice = await adminNoticePromise
    assert(adminNotice.title === 'Alert title', 'Admin notification title mismatch')

    clientCustomer.disconnect()
    clientRider.disconnect()
    clientAdmin.disconnect()
  })
}

runTests()
