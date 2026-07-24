/**
 * authUtils.js — Shared authentication utility functions
 */

import { toast } from 'react-hot-toast'

/**
 * Execute central logout action, clear credentials, and navigate to login.
 * @param {Function} logoutFn - The logout function returned from useAuth()
 * @param {Function} navigate - The navigate function from useNavigate()
 * @param {string} [customMessage] - Optional custom toast message
 */
export async function executeLogout(logoutFn, navigate, customMessage = 'Signed out successfully.') {
  try {
    if (logoutFn) {
      await logoutFn()
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    toast.success(customMessage)
    if (navigate) {
      navigate('/login')
    }
  }
}
