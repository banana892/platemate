/**
 * rider.service.js — Rider API Service (Phase F3)
 *
 * Handles HTTP requests for rider profile, availability status,
 * dashboard overview, and notifications.
 */

import api from './api.js'

export const riderService = {
  /**
   * Fetch rider dashboard statistics and active delivery counts
   */
  async getDashboard() {
    const response = await api.get('/rider/dashboard')
    return response.data
  },

  /**
   * Fetch rider profile details
   */
  async getProfile() {
    const response = await api.get('/rider/profile')
    return response.data
  },

  /**
   * Update rider profile details
   * @param {Object} profileData - { phone, vehicleType, vehicleNumber, licenseNumber, emergencyContact }
   */
  async updateProfile(profileData) {
    const response = await api.put('/rider/profile', profileData)
    return response.data
  },

  /**
   * Get current availability status
   */
  async getStatus() {
    const response = await api.get('/rider/status')
    return response.data
  },

  /**
   * Update availability status
   * @param {string} status - ONLINE | OFFLINE | BUSY | ON_BREAK
   */
  async updateStatus(status) {
    const response = await api.patch('/rider/status', { status })
    return response.data
  },

  /**
   * Fetch persistent rider notifications
   */
  async getNotifications() {
    const response = await api.get('/rider/notifications')
    return response.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead() {
    const response = await api.patch('/rider/notifications/read-all')
    return response.data
  },

  /**
   * Mark a single notification as read
   * @param {string} id - Notification UUID
   */
  async markNotificationRead(id) {
    const response = await api.patch(`/rider/notifications/${id}/read`)
    return response.data
  },
}

export default riderService
