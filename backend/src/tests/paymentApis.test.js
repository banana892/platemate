import './setup_env.js'
import http from 'http'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import app from '../app.js'
import prisma from '../config/db.js'
import { presence } from '../socket/socket.handlers.js'

const PORT = 5006
const BASE_URL = `http://localhost:${PORT}/api/v1`

// ── Mock Razorpay Gateway SDK Client handled inside provider for test env ─────

let server
let customerToken = null
let customerUserId = null
let adminToken = null
let testOrderId = null
let testPaymentId = null
let testProviderOrderId = null

let passCount = 0
let failCount = 0

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

const apiRequest = async (path, options = {}, useToken = undefined) => {
  const url = `${BASE_URL}${path}`
  const token = useToken !== undefined ? useToken : customerToken
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
  console.log('🚀 Starting PlateMate Payment API Integration Tests...\n')

  try {
    // 1. Start Server
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, () => {
        console.log(`📡 Test server listening on port ${PORT}\n`)
        resolve()
      })
    })

    // 2. Fetch logins
    const cRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'arjun@platemate.com', password: 'Password@123' }),
    })
    const cBody = await cRes.json()
    customerToken = cBody.data.accessToken
    customerUserId = cBody.data.user.id

    const aRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@platemate.com', password: 'Password@123' }),
    })
    const aBody = await aRes.json()
    adminToken = aBody.data.accessToken

    // Clean up test payments and orders from previous runs
    await prisma.payment.deleteMany({
      where: {
        OR: [
          { provider: 'COD' },
          { provider: 'RAZORPAY' }
        ]
      }
    })
    await prisma.order.deleteMany({
      where: {
        orderNumber: { startsWith: 'ORD-' }
      }
    })

    // Seed test order
    const rest = await prisma.restaurant.findFirst({ where: { deletedAt: null } })
    if (rest) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-PAY-${Date.now()}`,
          userId: customerUserId,
          restaurantId: rest.id,
          status: 'PENDING',
          subtotal: 150.0,
          deliveryFee: 30.0,
          totalAmount: 180.0,
          deliveryAddress: '123 Test St',
        },
      })
      testOrderId = order.id
    }

    // Run test cases
    await testPaymentInitialization()
    await testPaymentVerification()
    await testWebhookVerification()
    await testRefundControls()
    await testQueryAndHistory()
    await testAnalytics()
    await testValidationAndSecurity()

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`)
    if (failCount === 0) {
      console.log('🟢 ALL PAYMENT TESTS COMPLETED SUCCESSFULLY! 🎉')
      process.exit(0)
    } else {
      console.log('🔴 SOME TESTS FAILED.')
      process.exit(1)
    }
  } catch (err) {
    console.error('\n🔴 PAYMENT TEST SUITE FAILURE:', err.message)
    process.exit(1)
  } finally {
    if (server) server.close()
    await prisma.$disconnect()
  }
}

// ── 1. Payment Initialization ────────────────────────────────────────────────

const testPaymentInitialization = async () => {
  console.log('💰 [INITIALIZATION] Creating payment orders...')

  await test('POST /payments/create-order fails for invalid order ID', async () => {
    const { status } = await apiRequest('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: '00000000-0000-0000-0000-000000000000', method: 'UPI' }),
    })
    assert(status === 404, `Should get 404, got ${status}`)
  })

  await test('POST /payments/create-order creates Razorpay order reference', async () => {
    const { status, body } = await apiRequest('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: testOrderId, method: 'UPI' }),
    })
    if (status !== 201) {
      console.log('UNEXPECTED STATUS:', status, 'BODY:', JSON.stringify(body, null, 2))
    }
    assert(status === 201, `Should get 201, got ${status}`)
    assert(body.data.provider === 'RAZORPAY', 'Provider mismatch')
    assert(body.data.providerOrderId.startsWith('order_mock_'), 'Rzp order ID format mismatch')

    testPaymentId = body.data.paymentId
    testProviderOrderId = body.data.providerOrderId
  })

  await test('POST /payments/create-order bypasses gateway for COD method', async () => {
    // Seed another order to test COD
    const rest = await prisma.restaurant.findFirst({ where: { deletedAt: null } })
    const codOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-COD-${Date.now()}`,
        userId: customerUserId,
        restaurantId: rest.id,
        status: 'PENDING',
        subtotal: 100.0,
        deliveryFee: 30.0,
        totalAmount: 130.0,
        deliveryAddress: '123 COD Rd',
      },
    })

    const { status, body } = await apiRequest('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: codOrder.id, method: 'COD' }),
    })
    assert(status === 201, `Should get 201, got ${status}`)
    assert(body.data.provider === 'COD', 'Provider should be COD')
    assert(body.data.status === 'PENDING', 'COD payment status should be PENDING')

    // Confirm order state is updated to CONFIRMED for COD bypass
    const dbOrder = await prisma.order.findUnique({ where: { id: codOrder.id } })
    assert(dbOrder.status === 'CONFIRMED', 'COD bypass order should transition to CONFIRMED')
  })
}

// ── 2. Payment Verification ──────────────────────────────────────────────────

const testPaymentVerification = async () => {
  console.log('\n🔐 [VERIFICATION] Verifying payment signatures...')

  await test('POST /payments/verify rejects invalid signature', async () => {
    const { status } = await apiRequest('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        providerPaymentId: 'pay_12345',
        providerOrderId: testProviderOrderId,
        providerSignature: 'incorrectsignaturehash',
      }),
    })
    assert(status === 400, `Should get 400, got ${status}`)
  })

  const testVerifyPaymentId = `pay_mock_${Date.now()}`

  await test('POST /payments/verify accepts valid signature and captures payment', async () => {
    // Generate valid mock signature using secret='dummysecret' (from razorpay.provider.js dummy setup)
    const generatedSignature = crypto
      .createHmac('sha256', 'dummysecret')
      .update(testProviderOrderId + '|' + testVerifyPaymentId)
      .digest('hex')

    const { status, body } = await apiRequest('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        providerPaymentId: testVerifyPaymentId,
        providerOrderId: testProviderOrderId,
        providerSignature: generatedSignature,
      }),
    })

    assert(status === 200, `Should get 200, got ${status}`)
    assert(body.data.status === 'CAPTURED', 'Payment status should be CAPTURED')

    // Verify order transitions to CONFIRMED in DB
    const dbOrder = await prisma.order.findUnique({ where: { id: testOrderId } })
    assert(dbOrder.status === 'CONFIRMED', 'Order status should be CONFIRMED')
  })

  await test('POST /payments/verify handles duplicate calls idempotently', async () => {
    const { status, body } = await apiRequest('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        providerPaymentId: testVerifyPaymentId,
        providerOrderId: testProviderOrderId,
        providerSignature: 'anySignature', // signature check bypassed because it is already CAPTURED
      }),
    })
    assert(status === 200, `Should get 200, got ${status}`)
    assert(body.data.status === 'CAPTURED', 'Payment status should remain CAPTURED')
  })
}

// ── 3. Webhook Verification ──────────────────────────────────────────────────

const testWebhookVerification = async () => {
  console.log('\n⚓ [WEBHOOKS] Gateway webhook processing...')

  await test('POST /payments/webhook rejects payload with invalid signature', async () => {
    const { status } = await apiRequest(
      '/payments/webhook',
      {
        method: 'POST',
        headers: { 'x-razorpay-signature': 'badsignature' },
        body: JSON.stringify({ event: 'payment.captured' }),
      },
      null
    )
    assert(status === 400, `Should get 400, got ${status}`)
  })

  await test('POST /payments/webhook processes payment.captured event', async () => {
    // Seed new order and payment
    const rest = await prisma.restaurant.findFirst({ where: { deletedAt: null } })
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-WEB-${Date.now()}`,
        userId: customerUserId,
        restaurantId: rest.id,
        status: 'PENDING',
        subtotal: 200.0,
        deliveryFee: 30.0,
        totalAmount: 230.0,
        deliveryAddress: '123 St',
      },
    })
    const providerOrderId = `order_web_${Date.now()}`
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: customerUserId,
        provider: 'RAZORPAY',
        providerOrderId,
        amount: 230.0,
        status: 'PENDING',
        method: 'CARD',
      },
    })

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_web_captured_${Date.now()}`,
            order_id: providerOrderId,
            amount: 23000,
          },
        },
      },
    }

    const payloadString = JSON.stringify(payload)
    const signature = crypto.createHmac('sha256', 'dummywebhooksecret').update(payloadString).digest('hex')

    const { status, body } = await apiRequest(
      '/payments/webhook',
      {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: payloadString,
      },
      null
    )

    assert(status === 200, `Should get 200, got ${status}`)

    // Verify DB update
    const dbPayment = await prisma.payment.findUnique({ where: { id: payment.id } })
    assert(dbPayment.status === 'CAPTURED', 'Payment status should transition to CAPTURED via webhook')
    assert(dbPayment.providerPaymentId.startsWith('pay_web_captured_'), 'Payment transaction ID update check')
  })
}

// ── 4. Refund Controls ───────────────────────────────────────────────────────

const testRefundControls = async () => {
  console.log('\n💸 [REFUNDS] Admin refund control tests...')

  await test('POST /payments/:id/refund rejects amount exceeding captured amount', async () => {
    const { status, body } = await apiRequest(
      `/payments/${testPaymentId}/refund`,
      {
        method: 'POST',
        body: JSON.stringify({ amount: 500, reason: 'Exceeded test refund amount' }),
      },
      adminToken
    )
    assert(status === 400, `Should get 400, got ${status}`)
    assert(body.message.includes('exceeds'), 'Should contain refund exceed explanation')
  })

  await test('POST /payments/:id/refund processes partial refund successfully', async () => {
    const { status, body } = await apiRequest(
      `/payments/${testPaymentId}/refund`,
      {
        method: 'POST',
        body: JSON.stringify({ amount: 80, reason: 'Partial refund' }),
      },
      adminToken
    )

    assert(status === 200, `Should get 200, got ${status}`)
    assert(body.data.status === 'PARTIALLY_REFUNDED', 'Status should be PARTIALLY_REFUNDED')
    assert(body.data.refundAmount === 80, 'Refund amount mismatch')
  })

  await test('POST /payments/:id/refund processes full refund on remaining balance', async () => {
    const { status, body } = await apiRequest(
      `/payments/${testPaymentId}/refund`,
      {
        method: 'POST',
        body: JSON.stringify({ amount: 100, reason: 'Full refund remaining balance' }),
      },
      adminToken
    )

    assert(status === 200, `Should get 200, got ${status}`)
    assert(body.data.status === 'REFUNDED', 'Status should be REFUNDED')
    assert(body.data.refundAmount === 180, 'Refund amount mismatch')
  })
}

// ── 5. Query & History ───────────────────────────────────────────────────────

const testQueryAndHistory = async () => {
  console.log('\n📖 [HISTORY & DETAIL] Payment history lookups...')

  await test('GET /payments/history returns customer history', async () => {
    const { status, body } = await apiRequest('/payments/history?page=1&limit=5')
    assert(status === 200, `Should get 200, got ${status}`)
    assert(Array.isArray(body.data.payments), 'Payments must be array')
  })

  await test('GET /payments/:id returns payment details', async () => {
    const { status, body } = await apiRequest(`/payments/${testPaymentId}`)
    assert(status === 200, `Should get 200, got ${status}`)
    assert(body.data.id === testPaymentId, 'ID mismatch')
  })

  await test('GET /admin/payments returns list of payments for admin', async () => {
    const { status, body } = await apiRequest('/admin/payments?page=1&limit=10', {}, adminToken)
    assert(status === 200, `Should get 200, got ${status}`)
    assert(Array.isArray(body.data.payments), 'Payments must be array')
  })
}

// ── 6. Analytics ─────────────────────────────────────────────────────────────

const testAnalytics = async () => {
  console.log('\n📈 [ANALYTICS] Stats filters...')

  await test('GET /admin/payments/analytics compiles performance summary', async () => {
    const { status, body } = await apiRequest('/admin/payments/analytics?range=month', {}, adminToken)
    assert(status === 200, `Should get 200, got ${status}`)
    assert(body.data.summary.netRevenue !== undefined, 'netRevenue field check')
    assert(body.data.methodDistribution !== undefined, 'methodDistribution field check')
  })
}

// ── 7. Validation & Security ─────────────────────────────────────────────────

const testValidationAndSecurity = async () => {
  console.log('\n🛡️  [SECURITY & VALIDATION] Role guards and field validators...')

  await test('Customer token cannot access admin list returns 403', async () => {
    const { status } = await apiRequest('/admin/payments?page=1&limit=10')
    assert(status === 403, `Should get 403, got ${status}`)
  })

  await test('Create payment with invalid body fields returns 422', async () => {
    const { status } = await apiRequest('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'not-a-uuid', method: 'INVALID' }),
    })
    assert(status === 422, `Should get 422, got ${status}`)
  })
}

runTests()
