/**
 * api.js — Centralized Axios Client
 *
 * Features:
 * - Base URL configuration (/api/v1)
 * - 15-second request timeout to prevent hanging connections
 * - Automatic Authorization header injection from localStorage
 * - Safe 401 token refresh queue with Leader Election & cross-tab sync
 * - Standardized error extraction
 * - Development-only debug logging via authLogger
 */

import axios from 'axios'
import {
  acquireRefreshLeaderOrWait,
  notifyRefreshSuccess,
  notifyRefreshFailure,
} from '../utils/authTabSync.js'
import authLogger from '../utils/authLogger.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15s timeout
  withCredentials: true, // Send httpOnly cookies (for refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Access Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Flag, queue, AbortController, and session version counter to manage concurrent token refresh requests
let isRefreshing = false
let failedQueue = []
let refreshAbortController = null
let currentAuthSessionId = 0

const processQueue = (error, token = null) => {
  authLogger.queueState(error ? 'Flushing queue with error' : 'Processing queue with new token', failedQueue.length)
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Increment current session version ID on login/signup to invalidate
 * any past refresh attempts from previous accounts.
 */
export const incrementAuthSessionId = () => {
  const oldId = currentAuthSessionId
  currentAuthSessionId++
  authLogger.sessionChange(oldId, currentAuthSessionId)
  return currentAuthSessionId
}

/**
 * Cancel any pending token refresh request, clear the failed request queue,
 * wipe access token credentials, and bump the session ID counter.
 * Call this immediately on user logout to prevent session restoration race conditions.
 */
export const resetApiAuthState = () => {
  const oldId = currentAuthSessionId
  currentAuthSessionId++ // Invalidate active session ID version
  authLogger.sessionChange(oldId, currentAuthSessionId)

  if (refreshAbortController) {
    authLogger.refreshResult('Aborting in-flight refresh HTTP request', { sessionId: currentAuthSessionId })
    refreshAbortController.abort()
    refreshAbortController = null
  }

  processQueue(new Error('Authentication session terminated by logout.'), null)

  isRefreshing = false
  localStorage.removeItem('accessToken')
  delete api.defaults.headers.common.Authorization
}

// Helper to identify auth endpoints that should never trigger token refresh
const isAuthEndpoint = (url) => {
  if (!url) return false
  const normalized = url.toLowerCase()
  return (
    normalized.includes('auth/login') ||
    normalized.includes('auth/refresh') ||
    normalized.includes('auth/logout') ||
    normalized.includes('auth/register') ||
    normalized.includes('auth/forgot-password') ||
    normalized.includes('auth/reset-password')
  )
}

// Response Interceptor: Handle 401 & Automatic Refresh
api.interceptors.response.use(
  (response) => response.data, // Automatically return response.data
  async (error) => {
    const originalRequest = error.config || {}

    // Handle 401 Unauthorized (excluding auth endpoints to prevent infinite refresh loops)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
          authLogger.queueState('Request queued during refresh', failedQueue.length)
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true
      refreshAbortController = new AbortController()

      // Capture session ID at start of refresh operation
      const capturedSessionId = currentAuthSessionId

      try {
        // Attempt Cross-Tab Refresh Leader Election
        const election = await acquireRefreshLeaderOrWait()

        if (!election.isLeader) {
          // FOLLOWER TAB: Leader tab completed token refresh and broadcasted token!
          const followerToken = election.token || localStorage.getItem('accessToken')
          if (followerToken && capturedSessionId === currentAuthSessionId) {
            api.defaults.headers.common.Authorization = `Bearer ${followerToken}`
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${followerToken}`
            processQueue(null, followerToken)
            return api(originalRequest)
          } else {
            const err = new Error('Follower session state invalidated.')
            processQueue(err, null)
            return Promise.reject(err)
          }
        }

        // LEADER TAB: Perform actual /auth/refresh HTTP POST request to backend
        authLogger.refreshResult('Sending /auth/refresh POST request (Leader)', { url: originalRequest.url })
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            timeout: 8000,
            signal: refreshAbortController.signal,
          }
        )

        // Verify that neither logout nor account switch occurred during the HTTP call
        if (
          refreshAbortController?.signal?.aborted ||
          capturedSessionId !== currentAuthSessionId
        ) {
          const sessionErr = new Error('Session state changed during token refresh.')
          notifyRefreshFailure(sessionErr)
          processQueue(sessionErr, null)
          return Promise.reject(sessionErr)
        }

        const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken
        if (
          newAccessToken &&
          !refreshAbortController?.signal?.aborted &&
          capturedSessionId === currentAuthSessionId
        ) {
          localStorage.setItem('accessToken', newAccessToken)
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // Broadcast token to follower tabs and release leader lock
          notifyRefreshSuccess(newAccessToken)
          processQueue(null, newAccessToken)
          return api(originalRequest)
        } else {
          // Token missing, refresh aborted, or session ID invalidated — fail queue
          const refreshError = new Error('Session expired or invalidated. Please log in again.')
          notifyRefreshFailure(refreshError)
          processQueue(refreshError, null)
          localStorage.removeItem('accessToken')
          return Promise.reject(refreshError)
        }
      } catch (refreshErr) {
        notifyRefreshFailure(refreshErr)
        processQueue(refreshErr, null)
        localStorage.removeItem('accessToken')
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
        refreshAbortController = null
      }
    }

    // Standardize error message extraction
    let errorMessage = null
    const responseData = error.response?.data

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      const firstErr = responseData.errors[0]
      errorMessage = typeof firstErr === 'string' ? firstErr : firstErr?.message
    }

    if (!errorMessage) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.'
      } else {
        errorMessage = responseData?.message || error.message || 'An unexpected error occurred. Please try again.'
      }
    }

    const customError = new Error(errorMessage)
    customError.status = error.response?.status
    customError.data = responseData

    return Promise.reject(customError)
  }
)

export default api
