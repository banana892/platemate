/**
 * paymentSlice.js — Payment state machine for Phase 14 Razorpay Integration
 *
 * Tracks the full payment lifecycle without async thunks.
 * State transitions are driven by the usePayment hook.
 *
 * States:
 *  idle           → No payment in progress
 *  creatingOrder  → POST /api/v1/orders is pending
 *  openingCheckout → POST /api/v1/payments/create-order is pending; Razorpay modal not yet opened
 *  verifying      → Razorpay callback received; POST /api/v1/payments/verify pending
 *  success        → Payment verified and order confirmed
 *  failed         → Payment failed, cancelled, or verification error
 */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'idle', // 'idle' | 'creatingOrder' | 'openingCheckout' | 'verifying' | 'success' | 'failed'
  errorMessage: null,
  lastOrderId: null,
  lastPaymentId: null,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentIdle(state) {
      state.status = 'idle'
      state.errorMessage = null
    },
    paymentCreatingOrder(state) {
      state.status = 'creatingOrder'
      state.errorMessage = null
    },
    paymentOpeningCheckout(state, action) {
      state.status = 'openingCheckout'
      state.lastOrderId = action.payload?.orderId || null
      state.lastPaymentId = action.payload?.paymentId || null
      state.errorMessage = null
    },
    paymentVerifying(state) {
      state.status = 'verifying'
      state.errorMessage = null
    },
    paymentSuccess(state, action) {
      state.status = 'success'
      state.lastOrderId = action.payload?.orderId || state.lastOrderId
      state.errorMessage = null
    },
    paymentFailed(state, action) {
      state.status = 'failed'
      state.errorMessage = action.payload?.message || 'Payment failed'
    },
  },
})

// Selectors
export const selectPaymentStatus = (state) => state.payment.status
export const selectPaymentError = (state) => state.payment.errorMessage
export const selectIsPaymentProcessing = (state) =>
  ['creatingOrder', 'openingCheckout', 'verifying'].includes(state.payment.status)

export const {
  paymentIdle,
  paymentCreatingOrder,
  paymentOpeningCheckout,
  paymentVerifying,
  paymentSuccess,
  paymentFailed,
} = paymentSlice.actions

export default paymentSlice.reducer
