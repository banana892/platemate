/**
 * menu.service.js — Partner Menu Items API Service
 */

import api from './api.js'

export const menuService = {
  /**
   * Fetch all menu items for partner restaurant (with optional search/category filters)
   */
  async getMenuItems(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params.isAvailable !== undefined) searchParams.append('isAvailable', params.isAvailable)

    const response = await api.get(`/partner/menu-items?${searchParams.toString()}`)
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.menuItems)) return response.menuItems
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.data?.menuItems)) return response.data.menuItems
    return []
  },

  /**
   * Fetch single menu item by ID
   */
  async getMenuItemById(id) {
    const response = await api.get(`/partner/menu-items/${id}`)
    return response.data
  },

  /**
   * Create a new menu item
   */
  async createMenuItem(itemData) {
    const response = await api.post('/partner/menu-items', itemData)
    return response.data
  },

  /**
   * Update an existing menu item
   */
  async updateMenuItem(id, itemData) {
    const response = await api.put(`/partner/menu-items/${id}`, itemData)
    return response.data
  },

  /**
   * Delete (soft-delete) a menu item
   */
  async deleteMenuItem(id) {
    const response = await api.delete(`/partner/menu-items/${id}`)
    return response.data
  },

  /**
   * Toggle menu item in-stock availability
   */
  async toggleAvailability(id, isAvailable) {
    const response = await api.patch(`/partner/menu-items/${id}/availability`, { isAvailable })
    return response.data
  },

  /**
   * Upload dish/menu item image
   */
  async uploadMenuItemImage(id, file, onUploadProgress = null) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.patch(`/partner/menu/${id}/image`, formData, {
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

export default menuService
