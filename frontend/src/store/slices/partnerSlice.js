/**
 * partnerSlice.js — Redux Slice for Restaurant Partner Dashboard
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import partnerService from '../../services/partner.service.js'
import menuService from '../../services/menu.service.js'
import categoryService from '../../services/category.service.js'
import analyticsService from '../../services/analytics.service.js'
import { logout } from './authSlice.js'

const initialState = {
  restaurant: null,
  dashboard: null,
  menuItems: [],
  categories: [],
  orders: [],
  activeOrder: null,
  analytics: null,
  reviews: [],

  // Loading States
  loading: {
    dashboard: false,
    restaurant: false,
    updateRestaurant: false,
    businessHours: false,
    menu: false,
    menuAction: false,
    categories: false,
    categoryAction: false,
    orders: false,
    orderAction: false,
    analytics: false,
    reviews: false,
  },

  // Errors
  error: {
    dashboard: null,
    restaurant: null,
    menu: null,
    categories: null,
    orders: null,
    analytics: null,
  },
}

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchPartnerDashboardThunk = createAsyncThunk(
  'partner/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await partnerService.getDashboard()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchPartnerRestaurantThunk = createAsyncThunk(
  'partner/fetchRestaurant',
  async (_, { rejectWithValue }) => {
    try {
      const data = await partnerService.getProfile()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updatePartnerProfileThunk = createAsyncThunk(
  'partner/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await partnerService.updateProfile(profileData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updatePartnerSettingsThunk = createAsyncThunk(
  'partner/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const data = await partnerService.updateSettings(settingsData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchBusinessHoursThunk = createAsyncThunk(
  'partner/fetchBusinessHours',
  async (_, { rejectWithValue }) => {
    try {
      const data = await partnerService.getBusinessHours()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateBusinessHoursThunk = createAsyncThunk(
  'partner/updateBusinessHours',
  async (hoursData, { rejectWithValue }) => {
    try {
      const data = await partnerService.updateBusinessHours(hoursData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const toggleRestaurantOpenThunk = createAsyncThunk(
  'partner/toggleOpen',
  async ({ isOpen, reason }, { rejectWithValue }) => {
    try {
      if (isOpen) {
        const data = await partnerService.openRestaurant()
        return data
      } else {
        const data = await partnerService.closeRestaurant(reason)
        return data
      }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchPartnerMenuItemsThunk = createAsyncThunk(
  'partner/fetchMenuItems',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await menuService.getMenuItems(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createMenuItemThunk = createAsyncThunk(
  'partner/createMenuItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const data = await menuService.createMenuItem(itemData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateMenuItemThunk = createAsyncThunk(
  'partner/updateMenuItem',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = await menuService.updateMenuItem(id, data)
      return updated
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const deleteMenuItemThunk = createAsyncThunk(
  'partner/deleteMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      await menuService.deleteMenuItem(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const toggleMenuItemAvailabilityThunk = createAsyncThunk(
  'partner/toggleAvailability',
  async ({ id, isAvailable }, { rejectWithValue }) => {
    try {
      const updated = await menuService.toggleAvailability(id, isAvailable)
      return { id, isAvailable: updated.isAvailable !== undefined ? updated.isAvailable : isAvailable }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchPartnerCategoriesThunk = createAsyncThunk(
  'partner/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await categoryService.getCategories()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createCategoryThunk = createAsyncThunk(
  'partner/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const data = await categoryService.createCategory(categoryData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateCategoryThunk = createAsyncThunk(
  'partner/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = await categoryService.updateCategory(id, data)
      return updated
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const deleteCategoryThunk = createAsyncThunk(
  'partner/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchPartnerOrdersThunk = createAsyncThunk(
  'partner/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await partnerService.getDashboard()
      return response?.recentOrders || []
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateOrderStatusThunk = createAsyncThunk(
  'partner/updateOrderStatus',
  async ({ orderId, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const apiModule = await import('../../services/api.js')
      const response = await apiModule.default.patch(`/partner/orders/${orderId}/status`, {
        status,
        rejectionReason,
      })
      return { orderId, status, updatedOrder: response.data }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchPartnerAnalyticsThunk = createAsyncThunk(
  'partner/fetchAnalytics',
  async (range = 'month', { rejectWithValue }) => {
    try {
      const data = await analyticsService.getAnalytics(range)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice Definition ────────────────────────────────────────────────────────

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    setRestaurant(state, action) {
      state.restaurant = { ...state.restaurant, ...action.payload }
    },
    setActiveOrder(state, action) {
      state.activeOrder = action.payload
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchPartnerDashboardThunk.pending, (state) => {
        state.loading.dashboard = true
        state.error.dashboard = null
      })
      .addCase(fetchPartnerDashboardThunk.fulfilled, (state, action) => {
        state.loading.dashboard = false
        state.dashboard = action.payload
        if (action.payload?.restaurant) {
          state.restaurant = action.payload.restaurant
        }
        if (action.payload?.recentOrders) {
          state.orders = action.payload.recentOrders
        }
      })
      .addCase(fetchPartnerDashboardThunk.rejected, (state, action) => {
        state.loading.dashboard = false
        state.error.dashboard = action.payload
      })

    // Restaurant Profile
    builder
      .addCase(fetchPartnerRestaurantThunk.pending, (state) => {
        state.loading.restaurant = true
      })
      .addCase(fetchPartnerRestaurantThunk.fulfilled, (state, action) => {
        state.loading.restaurant = false
        state.restaurant = action.payload
      })
      .addCase(fetchPartnerRestaurantThunk.rejected, (state, action) => {
        state.loading.restaurant = false
        state.error.restaurant = action.payload
      })

    // Update Profile
    builder
      .addCase(updatePartnerProfileThunk.pending, (state) => {
        state.loading.updateRestaurant = true
      })
      .addCase(updatePartnerProfileThunk.fulfilled, (state, action) => {
        state.loading.updateRestaurant = false
        state.restaurant = { ...state.restaurant, ...action.payload }
      })
      .addCase(updatePartnerProfileThunk.rejected, (state) => {
        state.loading.updateRestaurant = false
      })

    // Toggle Open/Close
    builder.addCase(toggleRestaurantOpenThunk.fulfilled, (state, action) => {
      if (state.restaurant) {
        state.restaurant.isAvailable = action.payload?.isAvailable ?? action.payload?.isOpen ?? !state.restaurant.isAvailable
      }
    })

    // Fetch Menu Items
    builder
      .addCase(fetchPartnerMenuItemsThunk.pending, (state) => {
        state.loading.menu = true
      })
      .addCase(fetchPartnerMenuItemsThunk.fulfilled, (state, action) => {
        state.loading.menu = false
        state.menuItems = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.menuItems || [])
      })
      .addCase(fetchPartnerMenuItemsThunk.rejected, (state, action) => {
        state.loading.menu = false
        state.error.menu = action.payload
      })

    // Create / Update / Delete Menu Item
    builder.addCase(createMenuItemThunk.fulfilled, (state, action) => {
      if (!Array.isArray(state.menuItems)) state.menuItems = []
      state.menuItems.unshift(action.payload)
    })
    builder.addCase(updateMenuItemThunk.fulfilled, (state, action) => {
      const updated = action.payload
      if (!Array.isArray(state.menuItems)) state.menuItems = []
      state.menuItems = state.menuItems.map((item) => (item.id === updated.id ? updated : item))
    })
    builder.addCase(deleteMenuItemThunk.fulfilled, (state, action) => {
      if (!Array.isArray(state.menuItems)) state.menuItems = []
      state.menuItems = state.menuItems.filter((item) => item.id !== action.payload)
    })
    builder.addCase(toggleMenuItemAvailabilityThunk.fulfilled, (state, action) => {
      const { id, isAvailable } = action.payload
      if (!Array.isArray(state.menuItems)) state.menuItems = []
      state.menuItems = state.menuItems.map((item) =>
        item.id === id ? { ...item, isAvailable } : item
      )
    })

    // Fetch Categories
    builder
      .addCase(fetchPartnerCategoriesThunk.pending, (state) => {
        state.loading.categories = true
      })
      .addCase(fetchPartnerCategoriesThunk.fulfilled, (state, action) => {
        state.loading.categories = false
        state.categories = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.categories || [])
      })
      .addCase(fetchPartnerCategoriesThunk.rejected, (state, action) => {
        state.loading.categories = false
        state.error.categories = action.payload
      })

    // Category Mutations
    builder.addCase(createCategoryThunk.fulfilled, (state, action) => {
      state.categories.push(action.payload)
    })
    builder.addCase(updateCategoryThunk.fulfilled, (state, action) => {
      const updated = action.payload
      state.categories = state.categories.map((c) => (c.id === updated.id ? updated : c))
    })
    builder.addCase(deleteCategoryThunk.fulfilled, (state, action) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload)
    })

    // Update Order Status
    builder.addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
      const { orderId, status } = action.payload
      state.orders = state.orders.map((o) => (o.id === orderId ? { ...o, status } : o))
      if (state.activeOrder?.id === orderId) {
        state.activeOrder.status = status
      }
    })

    // Analytics
    builder
      .addCase(fetchPartnerAnalyticsThunk.pending, (state) => {
        state.loading.analytics = true
      })
      .addCase(fetchPartnerAnalyticsThunk.fulfilled, (state, action) => {
        state.loading.analytics = false
        state.analytics = action.payload || {}
      })
      .addCase(fetchPartnerAnalyticsThunk.rejected, (state, action) => {
        state.loading.analytics = false
        state.error.analytics = action.payload
      })

    // Reset partner state on logout
    builder.addCase(logout, () => initialState)
  },
})

export const { setRestaurant, setActiveOrder } = partnerSlice.actions
export default partnerSlice.reducer
