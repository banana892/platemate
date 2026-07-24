import api from './api.js'

export const favoriteService = {
  /**
   * Get all favorited restaurants for the logged in user
   */
  async getFavorites() {
    const response = await api.get('/favorites')
    return response.data || response
  },

  /**
   * Add restaurant to user's favorites
   */
  async addFavorite(restaurantId) {
    const response = await api.post(`/favorites/${restaurantId}`)
    return response.data || response
  },

  /**
   * Remove restaurant from user's favorites
   */
  async removeFavorite(restaurantId) {
    const response = await api.delete(`/favorites/${restaurantId}`)
    return response.data || response
  },
}

export default favoriteService
