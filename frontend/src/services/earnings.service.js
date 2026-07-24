/**
 * earnings.service.js — Earnings & Analytics Service (Phase F3)
 *
 * Handles HTTP requests for rider earnings breakdown and performance metrics.
 */

import api from './api.js'

export const earningsService = {
  /**
   * Fetch rider earnings breakdown over specified range
   * @param {Object} [params] - { range: 'today'|'week'|'month'|'custom', startDate, endDate }
   */
  async getEarnings(params = {}) {
    const response = await api.get('/rider/earnings', { params })
    return response.data
  },

  /**
   * Fetch rider performance analytics and statistics
   * @param {Object} [params] - { range: 'today'|'week'|'month'|'custom', startDate, endDate }
   */
  async getAnalytics(params = {}) {
    const response = await api.get('/rider/analytics', { params })
    return response.data
  },
}

export default earningsService
