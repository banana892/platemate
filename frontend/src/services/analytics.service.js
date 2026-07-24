/**
 * analytics.service.js — Partner Analytics & Reviews API Service
 */

import api from './api.js'

export const analyticsService = {
  /**
   * Fetch partner analytics & metrics (range: 'today' | 'week' | 'month' | 'year')
   */
  async getAnalytics(range = 'month') {
    const response = await api.get(`/partner/analytics?range=${range}`)
    return response?.data || response || {}
  },

  /**
   * Fetch customer reviews for restaurant
   */
  async getReviews(restaurantIdOrSlug = '') {
    try {
      if (restaurantIdOrSlug) {
        const response = await api.get(`/restaurants/${restaurantIdOrSlug}/reviews`)
        return response.data || []
      }
      const response = await api.get('/partner/dashboard')
      return response.data?.recentReviews || []
    } catch {
      return []
    }
  },
}

export default analyticsService
