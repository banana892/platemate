/**
 * authTabSync.js — Cross-Tab Authentication Synchronization & Leader Election Utility
 *
 * Features:
 * - Real-time cross-tab state propagation via BroadcastChannel API (with localStorage fallback)
 * - Single-transport dispatch & sender filtering (tabId !== TAB_ID) to eliminate broadcast loops
 * - Deduplicated toast notifications using explicit Toast IDs
 * - Atomic cross-tab Refresh Leader Election to prevent token refresh storms across multiple tabs
 * - Automatic lock TTL expiration and fail-safe leader recovery
 * - Development-only debug logging via authLogger
 */

import { toast } from 'react-hot-toast'
import { logout as logoutAction, checkAuthThunk } from '../store/slices/authSlice.js'
import { resetApiAuthState, incrementAuthSessionId } from '../services/api.js'
import authLogger from './authLogger.js'

const CHANNEL_NAME = 'platemate_auth_sync'
const STORAGE_KEY = 'platemate_auth_event'
const LOCK_KEY = 'platemate_refresh_lock'
const LOCK_TTL_MS = 5000 // 5 seconds lock timeout

// Unique random identifier for this browser tab instance
const TAB_ID = Math.random().toString(36).substring(2, 10)

let broadcastChannel = null
let pendingRefreshWaiters = []

// Initialize BroadcastChannel if supported by the browser
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }
} catch (_err) {
  broadcastChannel = null
}

/**
 * Broadcast an authentication event to all other open tabs.
 * Uses BroadcastChannel as primary transport, falling back to localStorage if unsupported.
 *
 * @param {object} payload - { type: 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'REFRESH_SUCCESS' | 'REFRESH_FAILURE', ... }
 */
export const broadcastAuthEvent = (payload) => {
  const eventPayload = { ...payload, tabId: TAB_ID, timestamp: Date.now() }
  authLogger.tabSync(payload.type, { tabId: TAB_ID, ...payload })

  // 1. Send via BroadcastChannel if available
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(eventPayload)
      return
    } catch (_err) {
      // Fallback below if BroadcastChannel fails
    }
  }

  // 2. Storage event fallback for older browsers / web workers
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventPayload))
  } catch (_err) {
    // Ignore storage write errors
  }
}

/**
 * Helper shortcut to broadcast login event across tabs
 */
export const broadcastAuthLogin = (userData) => {
  broadcastAuthEvent({ type: 'AUTH_LOGIN', data: userData })
}

/**
 * Helper shortcut to broadcast logout event across tabs
 */
export const broadcastAuthLogout = () => {
  authLogger.logoutPropagation('user_action')
  broadcastAuthEvent({ type: 'AUTH_LOGOUT' })
}

/**
 * Atomic release of localStorage refresh lock owned by this tab
 */
export const releaseRefreshLock = () => {
  try {
    const raw = localStorage.getItem(LOCK_KEY)
    if (raw) {
      const lock = JSON.parse(raw)
      if (lock.tabId === TAB_ID) {
        authLogger.lockEvent('Lock released', { tabId: TAB_ID })
        localStorage.removeItem(LOCK_KEY)
      }
    }
  } catch (_err) {
    localStorage.removeItem(LOCK_KEY)
  }
}

/**
 * Try to elect this tab as the Refresh Leader, or become a Follower and wait
 * for the active Leader tab to complete the token refresh.
 *
 * @returns {Promise<{ isLeader: boolean, token?: string }>}
 */
export const acquireRefreshLeaderOrWait = async () => {
  const now = Date.now()

  // Read current lock status
  let lock = null
  try {
    const raw = localStorage.getItem(LOCK_KEY)
    if (raw) lock = JSON.parse(raw)
  } catch (_err) {
    lock = null
  }

  // Check if lock exists and is valid (unexpired and owned by another tab)
  if (lock && lock.tabId && lock.expiresAt > now && lock.tabId !== TAB_ID) {
    authLogger.leaderElection('Elected as FOLLOWER', { leaderTabId: lock.tabId, currentTabId: TAB_ID, lockTTL: lock.expiresAt - now })

    // Another tab is already performing the refresh -> Become Follower and wait!
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        authLogger.leaderElection('Leader tab timeout — failover triggering', { leaderTabId: lock.tabId })
        releaseRefreshLock()
        reject(new Error('Refresh leader tab timed out.'))
      }, Math.max(100, lock.expiresAt - now + 500))

      pendingRefreshWaiters.push({ resolve, reject, timeoutId })
      authLogger.queueState('Follower waiting for leader refresh', pendingRefreshWaiters.length)
    })
  }

  // Lock is free, expired, or owned by us -> Elect current tab as Leader!
  try {
    const newLock = { tabId: TAB_ID, expiresAt: now + LOCK_TTL_MS }
    localStorage.setItem(LOCK_KEY, JSON.stringify(newLock))
    authLogger.leaderElection('Elected as LEADER', { tabId: TAB_ID, lockTTL: LOCK_TTL_MS })
    authLogger.lockEvent('Lock acquired', { tabId: TAB_ID, expiresAt: newLock.expiresAt })
  } catch (_err) {
    // Ignore storage write error
  }

  return { isLeader: true }
}

/**
 * Release refresh lock and notify all follower tabs of successful token refresh.
 */
export const notifyRefreshSuccess = (accessToken) => {
  authLogger.refreshResult('SUCCESS (Leader)', { tabId: TAB_ID })
  releaseRefreshLock()

  // Resolve local waiters in current tab if any
  pendingRefreshWaiters.forEach((w) => {
    clearTimeout(w.timeoutId)
    w.resolve({ isLeader: false, token: accessToken })
  })
  pendingRefreshWaiters = []

  // Broadcast token to follower tabs
  broadcastAuthEvent({ type: 'REFRESH_SUCCESS', token: accessToken })
}

/**
 * Release refresh lock and notify all follower tabs of refresh failure.
 */
export const notifyRefreshFailure = (error) => {
  authLogger.refreshResult('FAILURE (Leader)', { tabId: TAB_ID, error: error?.message || error })
  releaseRefreshLock()

  const errObj = typeof error === 'string' ? new Error(error) : error || new Error('Refresh failed in leader tab')

  // Reject local waiters in current tab
  pendingRefreshWaiters.forEach((w) => {
    clearTimeout(w.timeoutId)
    w.reject(errObj)
  })
  pendingRefreshWaiters = []

  // Broadcast error to follower tabs
  broadcastAuthEvent({ type: 'REFRESH_FAILURE', error: errObj.message })
}

/**
 * Process incoming cross-tab authentication and refresh synchronization events.
 */
const handleAuthSyncEvent = (eventData, dispatch) => {
  if (!eventData || !eventData.type || eventData.tabId === TAB_ID) return

  switch (eventData.type) {
    case 'AUTH_LOGOUT': {
      authLogger.logoutPropagation(`cross_tab (${eventData.tabId})`)
      resetApiAuthState()
      dispatch(logoutAction())
      toast('Logged out from another tab.', { id: 'cross-tab-logout-toast', icon: '🔒' })
      break
    }
    case 'AUTH_LOGIN': {
      authLogger.tabSync('AUTH_LOGIN received', { sourceTab: eventData.tabId })
      incrementAuthSessionId()
      dispatch(checkAuthThunk())
      toast('Session updated from another tab.', { id: 'cross-tab-login-toast', icon: '🔑' })
      break
    }
    case 'REFRESH_SUCCESS': {
      authLogger.refreshResult('SUCCESS (Follower notification received)', { leaderTabId: eventData.tabId })
      const newToken = eventData.token
      pendingRefreshWaiters.forEach((w) => {
        clearTimeout(w.timeoutId)
        w.resolve({ isLeader: false, token: newToken })
      })
      pendingRefreshWaiters = []
      break
    }
    case 'REFRESH_FAILURE': {
      authLogger.refreshResult('FAILURE (Follower notification received)', { leaderTabId: eventData.tabId, error: eventData.error })
      const err = new Error(eventData.error || 'Refresh failed in leader tab')
      pendingRefreshWaiters.forEach((w) => {
        clearTimeout(w.timeoutId)
        w.reject(err)
      })
      pendingRefreshWaiters = []
      break
    }
    default:
      break
  }
}

/**
 * Initialize cross-tab synchronization listener.
 * Call this once when the application mounts (e.g., in App.jsx).
 *
 * @param {Function} dispatch - Redux dispatch function
 */
export const initAuthTabSync = (dispatch) => {
  // 1. Listen via BroadcastChannel
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.tabId !== TAB_ID) {
        handleAuthSyncEvent(event.data, dispatch)
      }
    }
  }

  // 2. Listen via window storage event (fallback / cross-process guarantee)
  const handleStorageChange = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue)
        if (parsed && parsed.tabId !== TAB_ID) {
          handleAuthSyncEvent(parsed, dispatch)
        }
      } catch (_err) {
        // Ignore parse errors
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  // Cleanup handler function
  return () => {
    if (broadcastChannel) {
      broadcastChannel.onmessage = null
    }
    window.removeEventListener('storage', handleStorageChange)
  }
}
