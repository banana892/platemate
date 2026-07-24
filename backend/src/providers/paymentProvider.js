/**
 * paymentProvider.js — Abstract Base Class for Payment Gateway Providers (Phase 10)
 *
 * Defines the contract that every concrete payment gateway (e.g. RazorpayProvider, StripeProvider) must implement.
 */

export class PaymentProvider {
  /**
   * Initialize a transaction / order on the gateway.
   * @param {string} orderId - Unique internal order ID reference.
   * @param {number} amount - Total payable amount.
   * @param {string} currency - Transaction currency (e.g., INR).
   * @returns {Promise<{ providerOrderId: string, amount: number, currency: string, raw: any }>}
   */
  async createOrder(orderId, amount, currency) {
    throw new Error('Method "createOrder" must be implemented by concrete subclass')
  }

  /**
   * Verify signature authenticity.
   * @param {string} orderId - Internal order ID or gateway order ID.
   * @param {string} paymentId - Gateway payment ID.
   * @param {string} signature - Gateway hash signature.
   * @returns {boolean} True if signature matches.
   */
  verifySignature(orderId, paymentId, signature) {
    throw new Error('Method "verifySignature" must be implemented by concrete subclass')
  }

  /**
   * Process refund on a captured transaction.
   * @param {string} paymentId - Gateway payment transaction ID.
   * @param {number} amount - Refund amount.
   * @param {object} options - Additional metadata or reference keys.
   * @returns {Promise<{ refundId: string, status: string, amountRefunded: number, raw: any }>}
   */
  async refund(paymentId, amount, options = {}) {
    throw new Error('Method "refund" must be implemented by concrete subclass')
  }
}
export default PaymentProvider
