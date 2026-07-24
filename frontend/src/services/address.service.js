/**
 * address.service.js — Customer Address API Service
 */

import api from './api.js'

export const addressService = {
  /**
   * Fetch all saved addresses for the authenticated customer
   */
  async getAddresses() {
    const response = await api.get('/addresses')
    return response.data || []
  },

  /**
   * Get a single address by ID
   */
  async getAddressById(id) {
    const response = await api.get(`/addresses/${id}`)
    return response.data
  },

  /**
   * Create a new address
   */
  async createAddress(addressData) {
    const response = await api.post('/addresses', addressData)
    return response.data
  },

  /**
   * Update an existing address
   */
  async updateAddress(id, addressData) {
    const response = await api.put(`/addresses/${id}`, addressData)
    return response.data
  },

  /**
   * Delete an address
   */
  async deleteAddress(id) {
    const response = await api.delete(`/addresses/${id}`)
    return response.data
  },

  /**
   * Mark an address as the default address via PATCH /addresses/:id/default
   */
  async setDefaultAddress(id) {
    const response = await api.patch(`/addresses/${id}/default`)
    return response.data
  },
}

export default addressService

