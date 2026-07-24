/**
 * category.service.js — Partner Menu Categories API Service
 */

import api from './api.js'

export const categoryService = {
  /**
   * Fetch all categories for partner restaurant
   */
  async getCategories() {
    const response = await api.get('/partner/categories')
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.categories)) return response.categories
    if (Array.isArray(response?.data)) return response.data
    return []
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    const response = await api.post('/partner/categories', categoryData)
    return response.data
  },

  /**
   * Update an existing category
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/partner/categories/${id}`, categoryData)
    return response.data
  },

  /**
   * Delete a category (blocked on backend if items exist)
   */
  async deleteCategory(id) {
    const response = await api.delete(`/partner/categories/${id}`)
    return response.data
  },
}

export default categoryService
