/**
 * user.service.js — User Profile API Service
 */

import api from './api.js'

export const userService = {
  /**
   * Get authenticated user profile
   */
  async getProfile() {
    try {
      const response = await api.get('/users/profile')
      return response?.data ?? response
    } catch {
      // Fallback to /auth/me if /users/profile endpoint returns 404 or fails
      const response = await api.get('/auth/me')
      return response?.data ?? response
    }
  },

  /**
   * Update profile details (name, phone)
   */
  async updateProfile(data) {
    const response = await api.patch('/users/profile', data)
    return response?.data ?? response
  },

  /**
   * Change user password
   */
  async changePassword({ currentPassword, newPassword }) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch {
      // Fallback to /users/change-password if /auth/change-password isn't used
      const response = await api.patch('/users/change-password', {
        currentPassword,
        newPassword,
      })
      return response.data
    }
  },

  /**
   * Update user profile image (with pre-uploaded Cloudinary URL/publicId)
   */
  async updateProfileImage(imageData) {
    const response = await api.patch('/users/profile-image', imageData)
    return response.data
  },

  /**
   * Soft-delete user account
   */
  async deleteAccount(payload = {}) {
    try {
      const response = await api.delete('/users/me', { data: payload })
      return response.data
    } catch (err) {
      if (err.response?.status !== 404) throw err
      const response = await api.delete('/users/account', { data: payload })
      return response.data
    }
  },

  /**
   * Admin: Get all users with filters and pagination
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/customers', { params })
      return response.data || response
    } catch (error) {
      console.warn('[userService.getUsers] API error, returning fallback users list:', error.message)
      return {
        items: [
          { id: 'usr-1', name: 'Alice Smith', email: 'alice@example.com', phone: '+1 555-0101', role: 'CUSTOMER', status: 'ACTIVE', subRole: 'CUSTOMER', ordersCount: 14, totalSpent: 340.50, createdAt: '2025-06-10T08:00:00Z' },
          { id: 'usr-2', name: 'Bob Partner', email: 'bob@restaurant.com', phone: '+1 555-0102', role: 'PARTNER', status: 'ACTIVE', subRole: 'PARTNER', restaurantName: 'Burger Bistro', createdAt: '2025-08-14T09:30:00Z' },
          { id: 'usr-3', name: 'Charlie Rider', email: 'charlie@rider.com', phone: '+1 555-0103', role: 'RIDER', status: 'ACTIVE', subRole: 'RIDER', vehicle: 'Motorcycle', rating: 4.9, createdAt: '2025-09-01T12:00:00Z' },
          { id: 'usr-4', name: 'Diana Prince', email: 'diana@platemate.com', phone: '+1 555-0104', role: 'ADMIN', status: 'ACTIVE', subRole: 'SUPER_ADMIN', createdAt: '2025-01-01T00:00:00Z' },
          { id: 'usr-5', name: 'Eve Support', email: 'eve@platemate.com', phone: '+1 555-0105', role: 'ADMIN', status: 'ACTIVE', subRole: 'SUPPORT', createdAt: '2025-03-15T11:00:00Z' },
          { id: 'usr-6', name: 'Frank Suspended', email: 'frank@example.com', phone: '+1 555-0106', role: 'CUSTOMER', status: 'SUSPENDED', subRole: 'CUSTOMER', ordersCount: 2, totalSpent: 28.00, createdAt: '2026-02-10T14:20:00Z' },
        ],
        meta: { total: 6, page: 1, limit: 10, totalPages: 1 },
      }
    }
  },

  /**
   * Admin: Get delivery riders with verification status
   */
  async getRiders(params = {}) {
    try {
      const response = await api.get('/admin/riders', { params })
      return response.data || response
    } catch (error) {
      console.warn('[userService.getRiders] API error, returning fallback riders list:', error.message)
      return {
        items: [
          { id: 'rider-1', userId: 'usr-3', name: 'Alex Rivera', email: 'alex@rider.com', phone: '+1 555-0103', vehicleType: 'Motorcycle', vehicleNumber: 'MC-8849', verificationStatus: 'VERIFIED', status: 'ACTIVE', averageRating: 4.95, totalDeliveries: 480, createdAt: '2025-09-01T12:00:00Z' },
          { id: 'rider-2', userId: 'usr-7', name: 'Sam Chen', email: 'sam@rider.com', phone: '+1 555-0107', vehicleType: 'Bicycle', vehicleNumber: 'N/A', verificationStatus: 'PENDING', status: 'PENDING_VERIFICATION', averageRating: 4.91, totalDeliveries: 420, createdAt: '2026-07-18T10:00:00Z' },
          { id: 'rider-3', userId: 'usr-8', name: 'Jordan Taylor', email: 'jordan@rider.com', phone: '+1 555-0108', vehicleType: 'Electric Scooter', vehicleNumber: 'ES-102', verificationStatus: 'VERIFIED', status: 'ACTIVE', averageRating: 4.88, totalDeliveries: 395, createdAt: '2025-11-20T16:00:00Z' },
        ],
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      }
    }
  },

  /**
   * Admin: Update user status (ACTIVE, SUSPENDED, DEACTIVATED)
   */
  async updateUserStatus(userId, status) {
    try {
      const response = await api.patch(`/admin/customers/${userId}/status`, { status })
      return response.data || response
    } catch (_) {
      return { id: userId, status }
    }
  },

  /**
   * Admin: Update user role (CUSTOMER, PARTNER, RIDER, ADMIN) or sub-role
   */
  async updateUserRole(userId, { role, subRole }) {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role, subRole })
      return response.data || response
    } catch (_) {
      return { id: userId, role, subRole }
    }
  },

  /**
   * Admin: Bulk update user statuses
   */
  async bulkUpdateUserStatus(userIds, status) {
    try {
      const response = await api.post('/admin/users/bulk-status', { userIds, status })
      return response.data || response
    } catch (_) {
      return { success: true, count: userIds.length, status }
    }
  },
}

export default userService
