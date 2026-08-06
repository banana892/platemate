/**
 * usePayment.js — Razorpay + COD Payment Orchestration Hook (Phase 14)
 *
 * Encapsulates the full payment lifecycle:
 *  1. Create order (POST /api/v1/orders)
 *  2. Initialize payment session (POST /api/v1/payments/create-order)
 *  3. For COD: confirm immediately
 *  4. For Online: lazy-load Razorpay SDK → open modal → verify signature
 *
 * Security rules enforced:
 *  - Backend calculates totals from DB — frontend total is used only for display
 *  - Backend key is used if available from payment init response
 *  - Signature verification is always performed server-side
 *  - Cart is cleared ONLY after successful payment confirmation
 *
 * Redux state machine:
 *  idle → creatingOrder → openingCheckout → verifying → success | failed
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import orderService from '../services/order.service.js'
import paymentService from '../services/payment.service.js'
import { clearCart } from '../store/slices/cartSlice.js'
import {
  paymentIdle,
  paymentCreatingOrder,
  paymentOpeningCheckout,
  paymentVerifying,
  paymentSuccess,
  paymentFailed,
  selectPaymentStatus,
  selectIsPaymentProcessing,
} from '../store/slices/paymentSlice.js'

// ── Singleton script load guard ───────────────────────────────────────────────
let razorpayScriptPromise = null

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true)
  if (razorpayScriptPromise) return razorpayScriptPromise

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      razorpayScriptPromise = null // Allow retry on next call
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return razorpayScriptPromise
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePayment() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Read user info from Redux auth for Razorpay prefill
  const user = useSelector((state) => state.auth?.user || null)
  const paymentStatus = useSelector(selectPaymentStatus)
  const isProcessing = useSelector(selectIsPaymentProcessing)

  const initiatePayment = useCallback(async ({
    addressId,
    notes,
    items,
    paymentMethod,   // 'COD' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'
    total,           // Used for display label only — backend uses DB total
  }) => {
    if (!addressId) {
      toast.error('Please select a delivery address to continue.')
      return
    }

    // ── Step 1: Create Order ──────────────────────────────────────────────────
    dispatch(paymentCreatingOrder())
    let orderId, orderNumber

    try {
      const orderRes = await orderService.placeOrder({ addressId, notes, items })
      orderId = orderRes?.id || orderRes?.data?.id
      orderNumber = orderRes?.orderNumber || orderRes?.data?.orderNumber

      if (!orderId) {
        throw new Error('Order creation failed — no order ID returned.')
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create order.'
      toast.error(message)
      dispatch(paymentFailed({ message }))
      dispatch(paymentIdle())
      return
    }

    // ── Step 2: Initialize Payment Session ────────────────────────────────────
    dispatch(paymentOpeningCheckout({ orderId }))
    let paymentInit

    try {
      paymentInit = await paymentService.createPaymentOrder({ orderId, method: paymentMethod })
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to initialize payment.'
      toast.error(message)
      dispatch(paymentFailed({ message }))
      dispatch(paymentIdle())
      return
    }

    const providerOrderId = paymentInit?.providerOrderId || paymentInit?.data?.providerOrderId
    // Prefer key from backend; fall back to VITE env var
    const razorpayKey = paymentInit?.keyId || paymentInit?.data?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid'

    // ── COD Fast Path ─────────────────────────────────────────────────────────
    if (paymentMethod === 'COD') {
      dispatch(clearCart())
      dispatch(paymentSuccess({ orderId }))
      toast.success('Order placed via Cash on Delivery! 🎉')
      navigate('/profile/orders', { state: { newOrderId: orderId } })
      dispatch(paymentIdle())
      return
    }

    // ── Online Payment: Fast Path for Mock/Demo Provider Orders ──────────────
    if (providerOrderId && providerOrderId.startsWith('order_mock_')) {
      dispatch(paymentVerifying())
      try {
        await paymentService.verifyPayment({
          orderId,
          providerPaymentId: `pay_mock_${Date.now()}`,
          providerOrderId,
          providerSignature: 'mock_signature',
        })
        dispatch(clearCart())
        dispatch(paymentSuccess({ orderId }))
        toast.success('Payment verified & order confirmed! 🎉')
        navigate('/profile/orders', { state: { newOrderId: orderId } })
      } catch (verifyErr) {
        const message = verifyErr?.response?.data?.message || verifyErr?.message || 'Payment verification failed.'
        toast.error(message)
        dispatch(paymentFailed({ message }))
      } finally {
        dispatch(paymentIdle())
      }
      return
    }

    // ── Online Payment: Load Razorpay SDK ─────────────────────────────────────
    const loaded = await loadRazorpayScript()

    if (!loaded || !window.Razorpay) {
      const message = 'Payment gateway unavailable. Please try Cash on Delivery or retry later.'
      toast.error(message)
      dispatch(paymentFailed({ message }))
      dispatch(paymentIdle())
      return
    }

    // ── Step 3: Open Razorpay Checkout Modal ──────────────────────────────────
    const options = {
      key: razorpayKey,
      // amount is display-only — backend authorizes from DB totalAmount
      amount: Math.round((paymentInit?.amount || total || 0) * 100),
      currency: paymentInit?.currency || 'INR',
      name: 'PlateMate',
      description: `Order #${orderNumber || orderId.slice(0, 8)}`,
      order_id: providerOrderId,
      // Prefill authenticated user data
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || user?.profile?.phone || '',
      },
      notes: {
        orderId,
        orderNumber: orderNumber || '',
      },
      theme: {
        color: '#FF4F5A',
        backdrop_color: 'rgba(0,0,0,0.6)',
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
      timeout: 300, // 5 minutes
      modal: {
        backdropclose: false,
        escape: false,
        handleback: true,
        animation: true,
        ondismiss() {
          toast.error('Payment cancelled. Your order is pending.')
          dispatch(paymentFailed({ message: 'Payment cancelled by user' }))
          dispatch(paymentIdle())
        },
      },
      handler: async function (response) {
        // ── Step 4: Verify Payment (backend) ────────────────────────────────
        dispatch(paymentVerifying())
        try {
          await paymentService.verifyPayment({
            orderId,
            providerPaymentId: response.razorpay_payment_id,
            providerOrderId: response.razorpay_order_id,
            providerSignature: response.razorpay_signature,
          })
          dispatch(clearCart())
          dispatch(paymentSuccess({ orderId }))
          toast.success('Payment verified & order confirmed! 🎉')
          navigate('/profile/orders', { state: { newOrderId: orderId } })
        } catch (verifyErr) {
          const message = verifyErr?.response?.data?.message || verifyErr?.message || 'Payment verification failed.'
          toast.error(message)
          dispatch(paymentFailed({ message }))
        } finally {
          dispatch(paymentIdle())
        }
      },
    }

    try {
      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (failureResponse) {
        const reason = failureResponse?.error?.description || 'Payment declined by gateway'
        toast.error(`Payment failed: ${reason}`)
        dispatch(paymentFailed({ message: reason }))
        dispatch(paymentIdle())
      })

      rzp.open()
    } catch (err) {
      const message = err?.message || 'Unable to open payment gateway.'
      toast.error(message)
      dispatch(paymentFailed({ message }))
      dispatch(paymentIdle())
    }
  }, [dispatch, navigate, user])

  return {
    initiatePayment,
    paymentStatus,
    isProcessing,
  }
}

export default usePayment
