/**
 * auth.service.js — Frontend Authentication API Service
 *
 * The Axios interceptor in api.js already unwraps response.data,
 * returning the full ApiResponse body: { success, statusCode, message, data }.
 * Each method here extracts the relevant inner `data` field.
 */

import api from './api.js'

export const authService = {
  /**
   * Login with email and password
   * Backend returns ApiResponse { data: { user, accessToken } }
   */
  async login({ email, password }) {
    const body = await api.post('/auth/login', { email, password })
    return body?.data ?? body
  },

  /**
   * Register a new user account
   * Backend returns ApiResponse { data: user }
   */
  async register({ fullName, name, email, password, phone, role }) {
    const body = await api.post('/auth/register', {
      name: name || fullName,
      email,
      password,
      phone: phone || undefined,
      role: role ? role.toUpperCase() : 'CUSTOMER',
    })
    return body?.data ?? body
  },

  /**
   * Authenticate via Google (ID token, credential, or code)
   * Backend returns ApiResponse { data: { user, accessToken } }
   */
  async googleLogin(payload) {
    const body = await api.post('/auth/google/verify', payload)
    return body?.data ?? body
  },

  /**
   * Single device logout — best-effort, never throws
   */
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.warn('Logout API request failed:', error.message)
    }
  },

  /**
   * Logout from all devices — best-effort, never throws
   */
  async logoutAll() {
    try {
      await api.post('/auth/logout-all')
    } catch (error) {
      console.warn('Logout all API request failed:', error.message)
    }
  },

  /**
   * Get current authenticated user profile
   * Backend returns ApiResponse { data: { user fields... } }
   */
  async getMe() {
    const body = await api.get('/auth/me')
    return body?.data ?? body
  },
}

export default authService
