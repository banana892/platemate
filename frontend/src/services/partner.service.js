/**
 * partner.service.js — Restaurant Partner API Service (Phase F2)
 */

import api from './api.js'

export const partnerService = {
  /**
   * Fetch Partner Dashboard Overview metrics and recent activity
   */
  async getDashboard() {
    const response = await api.get('/partner/dashboard')
    return response.data
  },

  /**
   * Fetch partner restaurant profile details
   */
  async getProfile() {
    const response = await api.get('/partner/restaurant')
    return response.data
  },

  /**
   * Update restaurant profile details (name, description, phone, email, etc.)
   */
  async updateProfile(data) {
    const response = await api.put('/partner/restaurant', data)
    return response.data
  },

  /**
   * Fetch restaurant business settings (delivery radius, fee, min order, prep time)
   */
  async getSettings() {
    const response = await api.get('/partner/settings')
    return response.data
  },

  /**
   * Update restaurant business settings
   */
  async updateSettings(data) {
    const response = await api.put('/partner/settings', data)
    return response.data
  },

  /**
   * Fetch restaurant business hours schedule
   */
  async getBusinessHours() {
    const response = await api.get('/partner/business-hours')
    return response.data
  },

  /**
   * Update restaurant business hours schedule
   */
  async updateBusinessHours(hoursData) {
    const response = await api.put('/partner/business-hours', hoursData)
    return response.data
  },

  /**
   * Mark restaurant as OPEN for orders
   */
  async openRestaurant() {
    const response = await api.patch('/partner/restaurant/open')
    return response.data
  },

  /**
   * Mark restaurant as CLOSED for orders with optional reason
   */
  async closeRestaurant(reason = '') {
    const response = await api.patch('/partner/restaurant/close', { reason })
    return response.data
  },

  /**
   * Upload restaurant logo image
   */
  async uploadLogo(file, onUploadProgress = null) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.patch('/partner/restaurant/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return response.data
  },

  /**
   * Upload restaurant banner image
   */
  async uploadBanner(file, onUploadProgress = null) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.patch('/partner/restaurant/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return response.data
  },
}

export default partnerService
