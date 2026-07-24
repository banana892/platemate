/**
 * order.service.js — Customer Orders API Service
 */

import api from './api.js'

export const orderService = {
  /**
   * Fetch paginated order history for customer
   */
  async getOrders({ page = 1, limit = 10, status } = {}) {
    const params = new URLSearchParams()
    if (page) params.append('page', page)
    if (limit) params.append('limit', limit)
    if (status) params.append('status', status)

    const response = await api.get(`/orders?${params.toString()}`)
    return response.data || { orders: [], meta: {} }
  },

  /**
   * Fetch order details by ID
   */
  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  /**
   * Place a new order from the current cart.
   * @param {{ addressId: string, couponCode?: string, notes?: string, items?: Array }} payload
   */
  async placeOrder({ addressId, couponCode, notes, items } = {}) {
    const body = { addressId }
    if (couponCode) body.couponCode = couponCode
    if (notes) body.notes = notes
    if (Array.isArray(items) && items.length > 0) {
      body.items = items.map((item) => ({
        menuItemId: String(item.menuItemId || item.id),
        quantity: item.quantity,
      }))
    }
    const response = await api.post('/orders', body)
    return response.data
  },
}

export default orderService
