/**
 * razorpay.provider.js — Razorpay Payment Gateway Implementation (Phase 10)
 *
 * Implements the PaymentProvider contract for Razorpay.
 */

import crypto from 'crypto'
import Razorpay from 'razorpay'
import PaymentProvider from './paymentProvider.js'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

export class RazorpayProvider extends PaymentProvider {
  constructor() {
    super()
    this.keyId = env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid'
    this.keySecret = env.RAZORPAY_KEY_SECRET || 'dummysecret'

    this.client = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    })
  }

  /**
   * Initialize a transaction / order on Razorpay.
   */
  async createOrder(orderId, amount, currency = 'INR') {
    if (env.NODE_ENV === 'test') {
      return {
        providerOrderId: `order_mock_${Date.now()}`,
        amount: Number(amount),
        currency,
        raw: { id: `order_mock_${Date.now()}`, amount, currency },
      }
    }

    try {
      // Amount must be in subunits (paise for INR)
      const amountInSubunits = Math.round(Number(amount) * 100)

      const options = {
        amount: amountInSubunits,
        currency,
        receipt: orderId,
        payment_capture: 1, // Auto-capture payments
      }

      const order = await this.client.orders.create(options)
      logger.info({ orderId, rzpOrderId: order.id }, 'Razorpay order created successfully')

      return {
        providerOrderId: order.id,
        amount: Number(amount),
        currency,
        raw: order,
      }
    } catch (err) {
      logger.error({ orderId, err: err.message }, 'Failed to create Razorpay order')
      throw new Error(`Razorpay Order Creation Failed: ${err.message}`)
    }
  }

  /**
   * Verify Razorpay signature authenticity.
   */
  verifySignature(orderId, paymentId, signature) {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(orderId + '|' + paymentId)
        .digest('hex')

      return generatedSignature === signature
    } catch (err) {
      logger.error({ orderId, paymentId, err: err.message }, 'Razorpay signature verification check failed')
      return false
    }
  }

  /**
   * Process refund on a captured transaction.
   */
  async refund(paymentId, amount, options = {}) {
    if (env.NODE_ENV === 'test') {
      return {
        refundId: `rfnd_mock_${Date.now()}`,
        status: 'processed',
        amountRefunded: Number(amount),
        raw: { id: `rfnd_mock_${Date.now()}`, status: 'processed' },
      }
    }

    try {
      const amountInSubunits = Math.round(Number(amount) * 100)

      const refundOptions = {
        amount: amountInSubunits,
        speed: 'normal',
        notes: {
          reason: options.reason || 'Admin initiated refund',
          orderId: options.orderId || '',
        },
      }

      const refundResult = await this.client.payments.refund(paymentId, refundOptions)
      logger.info({ paymentId, refundId: refundResult.id }, 'Razorpay refund processed successfully')

      return {
        refundId: refundResult.id,
        status: refundResult.status === 'processed' ? 'processed' : refundResult.status,
        amountRefunded: Number(refundResult.amount) / 100,
        raw: refundResult,
      }
    } catch (err) {
      logger.error({ paymentId, err: err.message }, 'Failed to process Razorpay refund')
      throw new Error(`Razorpay Refund Failed: ${err.message}`)
    }
  }
}

export default RazorpayProvider
