/**
 * adminSlice.js — Redux Toolkit Slice for Admin Dashboard (Phase F4)
 *
 * Manages central admin state, async thunks, sub-role context, and real-time socket events.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminService from '../../services/admin.service.js'
import userService from '../../services/user.service.js'
import restaurantAdminService from '../../services/restaurant-admin.service.js'
import orderAdminService from '../../services/order-admin.service.js'
import paymentService from '../../services/payment.service.js'
import analyticsAdminService from '../../services/analytics-admin.service.js'
import systemService from '../../services/system.service.js'
import { logout } from './authSlice.js'

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchAdminDashboardThunk = createAsyncThunk('admin/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getDashboard()
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch dashboard data')
  }
})

export const performGlobalSearchThunk = createAsyncThunk('admin/globalSearch', async (query, { rejectWithValue }) => {
  try {
    return await adminService.globalSearch(query)
  } catch (err) {
    return rejectWithValue(err.message || 'Global search failed')
  }
})

export const fetchOperationalAlertsThunk = createAsyncThunk('admin/fetchAlerts', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getOperationalAlerts()
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch operational alerts')
  }
})

export const fetchAdminUsersThunk = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    return await userService.getUsers(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch users')
  }
})

export const fetchAdminRidersThunk = createAsyncThunk('admin/fetchRiders', async (params, { rejectWithValue }) => {
  try {
    return await userService.getRiders(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch riders')
  }
})

export const fetchAdminRestaurantsThunk = createAsyncThunk('admin/fetchRestaurants', async (params, { rejectWithValue }) => {
  try {
    return await restaurantAdminService.getRestaurants(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch restaurants')
  }
})

export const fetchAdminOrdersThunk = createAsyncThunk('admin/fetchOrders', async (params, { rejectWithValue }) => {
  try {
    return await orderAdminService.getOrders(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch orders')
  }
})

export const fetchAdminPaymentsThunk = createAsyncThunk('admin/fetchPayments', async (params, { rejectWithValue }) => {
  try {
    return await paymentService.getPayments(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch payments')
  }
})

export const fetchAdminAnalyticsThunk = createAsyncThunk('admin/fetchAnalytics', async (params, { rejectWithValue }) => {
  try {
    return await analyticsAdminService.getAnalytics(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch analytics')
  }
})

export const fetchSystemHealthThunk = createAsyncThunk('admin/fetchSystemHealth', async (_, { rejectWithValue }) => {
  try {
    return await systemService.getSystemHealth()
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch system health')
  }
})

export const fetchFeatureFlagsThunk = createAsyncThunk('admin/fetchFeatureFlags', async (_, { rejectWithValue }) => {
  try {
    return await systemService.getFeatureFlags()
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch feature flags')
  }
})

export const fetchAuditLogsThunk = createAsyncThunk('admin/fetchAuditLogs', async (params, { rejectWithValue }) => {
  try {
    return await adminService.getAuditLogs(params)
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch audit logs')
  }
})

export const fetchSettingsThunk = createAsyncThunk('admin/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    return await adminService.getSettings()
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch settings')
  }
})

// Initial State
const initialState = {
  currentSubRole: 'SUPER_ADMIN', // SUPER_ADMIN, OPERATIONS, SUPPORT, FINANCE
  dashboardData: null,
  globalSearchResults: { users: [], restaurants: [], riders: [], orders: [] },
  operationalAlerts: [],
  auditLogs: { items: [], meta: {} },
  
  users: { items: [], meta: {} },
  selectedUserIds: [],
  selectedUser: null,

  restaurants: { items: [], meta: {} },
  selectedRestaurantIds: [],
  selectedRestaurant: null,

  riders: { items: [], meta: {} },
  selectedRiderIds: [],
  selectedRider: null,

  orders: { items: [], meta: {} },
  selectedOrderIds: [],
  selectedOrder: null,

  payments: { summary: {}, items: [], meta: {} },
  analytics: null,
  disputes: [
    { id: 'dsp-1', ticketNo: 'DSP-401', customerName: 'John Doe', restaurantName: 'Burger Bistro', riderName: 'Alex Rivera', issue: 'Missing item in combo meal', priority: 'HIGH', status: 'OPEN', createdAt: new Date().toISOString() },
    { id: 'dsp-2', ticketNo: 'DSP-402', customerName: 'Jane Smith', restaurantName: 'Spice Garden', riderName: 'Sam Chen', issue: 'Delayed delivery over 45 minutes', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  notifications: [],
  settings: null,
  featureFlags: {},
  systemHealth: null,

  loading: {
    dashboard: false,
    users: false,
    restaurants: false,
    orders: false,
    payments: false,
    analytics: false,
    system: false,
    search: false,
  },
  errors: {},
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSubRole: (state, action) => {
      state.currentSubRole = action.payload
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload
    },
    setSelectedRider: (state, action) => {
      state.selectedRider = action.payload
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload
    },
    toggleSelectUserId: (state, action) => {
      const id = action.payload
      if (state.selectedUserIds.includes(id)) {
        state.selectedUserIds = state.selectedUserIds.filter(i => i !== id)
      } else {
        state.selectedUserIds.push(id)
      }
    },
    selectAllUserIds: (state, action) => {
      state.selectedUserIds = action.payload
    },
    clearSelectedUserIds: (state) => {
      state.selectedUserIds = []
    },
    updateFeatureFlagLocal: (state, action) => {
      const { flagName, enabled } = action.payload
      if (state.featureFlags) {
        state.featureFlags[flagName] = enabled
      }
    },
    handleSocketNotification: (state, action) => {
      state.notifications.unshift(action.payload)
    },
    handleSocketOrderUpdate: (state, action) => {
      const updatedOrder = action.payload
      if (state.orders.items) {
        const idx = state.orders.items.findIndex(o => o.id === updatedOrder.id)
        if (idx !== -1) {
          state.orders.items[idx] = { ...state.orders.items[idx], ...updatedOrder }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchAdminDashboardThunk.pending, (state) => {
        state.loading.dashboard = true
      })
      .addCase(fetchAdminDashboardThunk.fulfilled, (state, action) => {
        state.loading.dashboard = false
        state.dashboardData = action.payload
      })
      .addCase(fetchAdminDashboardThunk.rejected, (state, action) => {
        state.loading.dashboard = false
        state.errors.dashboard = action.payload
      })
      // Global Search
      .addCase(performGlobalSearchThunk.pending, (state) => {
        state.loading.search = true
      })
      .addCase(performGlobalSearchThunk.fulfilled, (state, action) => {
        state.loading.search = false
        state.globalSearchResults = action.payload
      })
      // Operational Alerts
      .addCase(fetchOperationalAlertsThunk.fulfilled, (state, action) => {
        state.operationalAlerts = action.payload
      })
      // Users
      .addCase(fetchAdminUsersThunk.pending, (state) => {
        state.loading.users = true
      })
      .addCase(fetchAdminUsersThunk.fulfilled, (state, action) => {
        state.loading.users = false
        state.users = action.payload
      })
      // Riders
      .addCase(fetchAdminRidersThunk.fulfilled, (state, action) => {
        state.riders = action.payload
      })
      // Restaurants
      .addCase(fetchAdminRestaurantsThunk.pending, (state) => {
        state.loading.restaurants = true
      })
      .addCase(fetchAdminRestaurantsThunk.fulfilled, (state, action) => {
        state.loading.restaurants = false
        state.restaurants = action.payload
      })
      // Orders
      .addCase(fetchAdminOrdersThunk.pending, (state) => {
        state.loading.orders = true
      })
      .addCase(fetchAdminOrdersThunk.fulfilled, (state, action) => {
        state.loading.orders = false
        state.orders = action.payload
      })
      // Payments
      .addCase(fetchAdminPaymentsThunk.pending, (state) => {
        state.loading.payments = true
      })
      .addCase(fetchAdminPaymentsThunk.fulfilled, (state, action) => {
        state.loading.payments = false
        state.payments = action.payload
      })
      // Analytics
      .addCase(fetchAdminAnalyticsThunk.pending, (state) => {
        state.loading.analytics = true
      })
      .addCase(fetchAdminAnalyticsThunk.fulfilled, (state, action) => {
        state.loading.analytics = false
        state.analytics = action.payload
      })
      // System Health
      .addCase(fetchSystemHealthThunk.fulfilled, (state, action) => {
        state.systemHealth = action.payload
      })
      // Feature Flags
      .addCase(fetchFeatureFlagsThunk.fulfilled, (state, action) => {
        state.featureFlags = action.payload
      })
      // Audit Logs
      .addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
        state.auditLogs = action.payload
      })
      // Settings
      .addCase(fetchSettingsThunk.fulfilled, (state, action) => {
        state.settings = action.payload
      })
      // Reset admin state on logout
      .addCase(logout, () => initialState)
  },
})

export const {
  setSubRole,
  setSelectedUser,
  setSelectedRestaurant,
  setSelectedRider,
  setSelectedOrder,
  toggleSelectUserId,
  selectAllUserIds,
  clearSelectedUserIds,
  updateFeatureFlagLocal,
  handleSocketNotification,
  handleSocketOrderUpdate,
} = adminSlice.actions

export default adminSlice.reducer
