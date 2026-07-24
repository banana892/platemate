/**
 * delivery.service.js — Delivery Operations Service (Phase F3)
 *
 * Handles HTTP requests for active deliveries, single order details,
 * delivery status state machine transitions, and delivery history logs.
 */

import api from './api.js'

export const deliveryService = {
  /**
   * Fetch active deliveries assigned to rider
   * @param {Object} [params] - { page, limit, status, sortBy, order }
   */
  async getActiveOrders(params = {}) {
    const response = await api.get('/rider/orders', { params })
    return response.data
  },

  /**
   * Fetch details of a single delivery order
   * @param {string} id - Order UUID
   */
  async getOrderById(id) {
    const response = await api.get(`/rider/orders/${id}`)
    return response.data
  },

  /**
   * Update status of an assigned delivery
   * @param {string} id - Order UUID
   * @param {string} status - READY_FOR_PICKUP | OUT_FOR_DELIVERY | DELIVERED
   */
  async updateDeliveryStatus(id, status) {
    const response = await api.patch(`/rider/orders/${id}/status`, { status })
    return response.data
  },

  /**
   * Fetch rider delivery history with search & date filtering
   * @param {Object} [params] - { page, limit, startDate, endDate, search, sortBy, order }
   */
  async getDeliveryHistory(params = {}) {
    const response = await api.get('/rider/history', { params })
    return response // includes meta & data
  },
}

export default deliveryService
