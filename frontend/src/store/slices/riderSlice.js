/**
 * riderSlice.js — Redux Toolkit Slice for Delivery Rider (Phase F3)
 *
 * Manages state for:
 * - Rider profile & vehicle information
 * - Online / Offline availability status & shift timer
 * - Assigned active deliveries & delivery status updates
 * - Delivery history & pagination
 * - Earnings & performance statistics
 * - Persistent notification center
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import riderService from '../../services/rider.service.js'
import deliveryService from '../../services/delivery.service.js'
import earningsService from '../../services/earnings.service.js'
import { logout } from './authSlice.js'

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchRiderDashboard = createAsyncThunk(
  'rider/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await riderService.getDashboard()
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard')
    }
  }
)

export const fetchRiderProfile = createAsyncThunk(
  'rider/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await riderService.getProfile()
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch profile')
    }
  }
)

export const updateRiderProfile = createAsyncThunk(
  'rider/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await riderService.updateProfile(profileData)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update profile')
    }
  }
)

export const fetchRiderStatus = createAsyncThunk(
  'rider/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = await riderService.getStatus()
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch availability status')
    }
  }
)

export const updateRiderStatus = createAsyncThunk(
  'rider/updateStatus',
  async (status, { rejectWithValue, dispatch }) => {
    try {
      const data = await riderService.updateStatus(status)
      if (status === 'ONLINE') {
        dispatch(startShift())
      } else if (status === 'OFFLINE') {
        dispatch(endShift())
      }
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update status')
    }
  }
)

export const fetchActiveDeliveries = createAsyncThunk(
  'rider/fetchActiveDeliveries',
  async (params, { rejectWithValue }) => {
    try {
      const data = await deliveryService.getActiveOrders(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch active deliveries')
    }
  }
)

export const fetchDeliveryById = createAsyncThunk(
  'rider/fetchDeliveryById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deliveryService.getOrderById(id)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch delivery details')
    }
  }
)

export const updateDeliveryStatus = createAsyncThunk(
  'rider/updateDeliveryStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const data = await deliveryService.updateDeliveryStatus(id, status)
      // Refresh active deliveries and dashboard
      dispatch(fetchActiveDeliveries())
      dispatch(fetchRiderDashboard())
      return { id, status, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update delivery status')
    }
  }
)

export const fetchDeliveryHistory = createAsyncThunk(
  'rider/fetchDeliveryHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getDeliveryHistory(params)
      const dataPayload = response?.data || response
      const items = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.deliveries || dataPayload.items || dataPayload.orders || []
      const meta = dataPayload.pagination || response.meta || dataPayload.meta || { page: 1, limit: 10, totalPages: 1, totalCount: 0 }

      return { items, meta }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch delivery history')
    }
  }
)

export const fetchEarnings = createAsyncThunk(
  'rider/fetchEarnings',
  async (params, { rejectWithValue }) => {
    try {
      const data = await earningsService.getEarnings(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch earnings')
    }
  }
)

export const fetchAnalytics = createAsyncThunk(
  'rider/fetchAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const data = await earningsService.getAnalytics(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch performance analytics')
    }
  }
)

export const fetchNotifications = createAsyncThunk(
  'rider/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const data = await riderService.getNotifications()
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch notifications')
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk(
  'rider/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await riderService.markAllNotificationsRead()
      return true
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark notifications read')
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'rider/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      await riderService.markNotificationRead(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark notification read')
    }
  }
)

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  profile: null,
  status: 'OFFLINE', // ONLINE | OFFLINE | BUSY | ON_BREAK
  shift: {
    startTime: null,
    onlineMinutes: 0,
    shiftDeliveries: 0,
    isActive: false,
  },
  dashboard: null,
  activeDeliveries: [],
  selectedDelivery: null,
  history: [],
  historyPagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  },
  earnings: null,
  analytics: null,
  notifications: [],
  unreadNotificationsCount: 0,
  loading: false,
  actionLoading: false,
  error: null,
}

// ── Slice Definition ──────────────────────────────────────────────────────────

const riderSlice = createSlice({
  name: 'rider',
  initialState,
  reducers: {
    startShift(state) {
      if (!state.shift.isActive) {
        state.shift.startTime = new Date().toISOString()
        state.shift.isActive = true
      }
    },
    endShift(state) {
      state.shift.isActive = false
    },
    incrementShiftTime(state) {
      if (state.shift.isActive) {
        state.shift.onlineMinutes += 1
      }
    },
    addNotificationFromSocket(state, action) {
      state.notifications.unshift(action.payload)
      state.unreadNotificationsCount += 1
    },
    updateActiveDeliveryFromSocket(state, action) {
      const updatedOrder = action.payload
      const idx = state.activeDeliveries.findIndex((o) => o.id === updatedOrder.id)
      if (idx !== -1) {
        if (updatedOrder.status === 'DELIVERED' || updatedOrder.status === 'CANCELLED') {
          state.activeDeliveries.splice(idx, 1)
          state.shift.shiftDeliveries += 1
        } else {
          state.activeDeliveries[idx] = { ...state.activeDeliveries[idx], ...updatedOrder }
        }
      } else if (updatedOrder.status !== 'DELIVERED' && updatedOrder.status !== 'CANCELLED') {
        state.activeDeliveries.unshift(updatedOrder)
      }
    },
    clearRiderError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchRiderDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRiderDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
        if (action.payload?.onlineStatus) {
          state.status = action.payload.onlineStatus
          if (state.status === 'ONLINE' && !state.shift.isActive) {
            state.shift.isActive = true
            state.shift.startTime = state.shift.startTime || new Date().toISOString()
          }
        }
      })
      .addCase(fetchRiderDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Profile
      .addCase(fetchRiderProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        if (action.payload?.settings?.riderStatus) {
          state.status = action.payload.settings.riderStatus
        }
      })
      .addCase(updateRiderProfile.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateRiderProfile.fulfilled, (state, action) => {
        state.actionLoading = false
        state.profile = { ...state.profile, ...action.payload }
      })
      .addCase(updateRiderProfile.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Status
      .addCase(fetchRiderStatus.fulfilled, (state, action) => {
        state.status = action.payload?.status || action.payload?.onlineStatus || state.status
      })
      .addCase(updateRiderStatus.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateRiderStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        state.status = action.payload?.onlineStatus || action.payload?.status || state.status
      })
      .addCase(updateRiderStatus.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Active Deliveries
      .addCase(fetchActiveDeliveries.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchActiveDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.activeDeliveries = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.orders || []
      })
      .addCase(fetchActiveDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delivery by ID
      .addCase(fetchDeliveryById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDeliveryById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDelivery = action.payload
      })
      .addCase(fetchDeliveryById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Delivery Status
      .addCase(updateDeliveryStatus.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        if (state.selectedDelivery && state.selectedDelivery.id === action.payload.id) {
          state.selectedDelivery.status = action.payload.status
        }
      })
      .addCase(updateDeliveryStatus.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // History
      .addCase(fetchDeliveryHistory.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDeliveryHistory.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload.items
        state.historyPagination = action.payload.meta
      })
      .addCase(fetchDeliveryHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Earnings
      .addCase(fetchEarnings.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.loading = false
        state.earnings = action.payload
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.analytics = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const notifs = Array.isArray(action.payload) ? action.payload : action.payload?.notifications || []
        state.notifications = notifs
        state.unreadNotificationsCount = notifs.filter((n) => !n.isRead).length
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }))
        state.unreadNotificationsCount = 0
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload
        state.notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1)
      })

      // Reset rider state on logout
      .addCase(logout, () => initialState)
  },
})

export const {
  startShift,
  endShift,
  incrementShiftTime,
  addNotificationFromSocket,
  updateActiveDeliveryFromSocket,
  clearRiderError,
} = riderSlice.actions

export default riderSlice.reducer
