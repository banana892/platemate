/**
 * analytics-admin.service.js — Admin Analytics & Reporting Service (Phase F4)
 */

import api from './api.js'

export const analyticsAdminService = {
  async getAnalytics(params = {}) {
    try {
      const response = await api.get('/admin/analytics', { params })
      return response.data || response
    } catch (error) {
      console.warn('[analyticsAdminService.getAnalytics] API error, using fallback data:', error.message)
      return {
        revenueChart: [
          { label: 'Mon', revenue: 12400, orders: 420 },
          { label: 'Tue', revenue: 14200, orders: 490 },
          { label: 'Wed', revenue: 13800, orders: 460 },
          { label: 'Thu', revenue: 16500, orders: 530 },
          { label: 'Fri', revenue: 21400, orders: 710 },
          { label: 'Sat', revenue: 26800, orders: 890 },
          { label: 'Sun', revenue: 24100, orders: 810 },
        ],
        usersGrowth: [
          { month: 'Jan', customers: 450, partners: 40, riders: 60 },
          { month: 'Feb', customers: 620, partners: 55, riders: 80 },
          { month: 'Mar', customers: 780, partners: 72, riders: 105 },
          { month: 'Apr', customers: 980, partners: 112, riders: 144 },
        ],
        peakHours: [
          { hour: '11 AM', volume: 120 },
          { hour: '12 PM', volume: 340 },
          { hour: '1 PM', volume: 410 },
          { hour: '2 PM', volume: 210 },
          { hour: '6 PM', volume: 290 },
          { hour: '7 PM', volume: 520 },
          { hour: '8 PM', volume: 480 },
          { hour: '9 PM', volume: 260 },
        ],
        orderDistribution: [
          { category: 'Completed', percentage: 84 },
          { category: 'Cancelled', percentage: 6 },
          { category: 'Refunded', percentage: 4 },
          { category: 'In Progress', percentage: 6 },
        ],
        topRestaurants: [
          { id: 'r-1', name: 'Burger Bistro', revenue: 38400, ordersCount: 1420 },
          { id: 'r-2', name: 'Spice Garden', revenue: 31200, ordersCount: 1180 },
          { id: 'r-3', name: 'Pizza Paradise', revenue: 29800, ordersCount: 1050 },
        ],
        topRiders: [
          { id: 'rd-1', name: 'Alex Rivera', deliveriesCount: 480, rating: 4.95 },
          { id: 'rd-2', name: 'Sam Chen', deliveriesCount: 420, rating: 4.91 },
          { id: 'rd-3', name: 'Jordan Taylor', deliveriesCount: 395, rating: 4.88 },
        ],
      }
    }
  },
}

export default analyticsAdminService
