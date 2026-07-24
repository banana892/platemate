/**
 * profileSlice.js — Redux Slice for Customer Profile, Addresses, Orders & Preferences
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userService from '../../services/user.service.js'
import addressService from '../../services/address.service.js'
import orderService from '../../services/order.service.js'
import { logout } from './authSlice.js'

// Initial preferences loaded from localStorage
const getSavedPreferences = () => {
  try {
    const saved = localStorage.getItem('platemate_preferences')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const defaultPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  language: 'en',
  theme: 'light',
}

const initialState = {
  profile: null,
  addresses: [],
  orders: {
    list: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
  },
  activeOrder: null,
  preferences: getSavedPreferences() || defaultPreferences,

  // Loading States
  loading: {
    profile: false,
    updateProfile: false,
    avatarUpload: false,
    passwordChange: false,
    addresses: false,
    addressAction: false,
    orders: false,
    orderDetails: false,
  },

  // Error States
  error: {
    profile: null,
    updateProfile: null,
    passwordChange: null,
    addresses: null,
    orders: null,
    orderDetails: null,
  },
}

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchProfileThunk = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userService.getProfile()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateProfileThunk = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await userService.updateProfile(profileData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const changePasswordThunk = createAsyncThunk(
  'profile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await userService.changePassword(passwordData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchAddressesThunk = createAsyncThunk(
  'profile/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const data = await addressService.getAddresses()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const addAddressThunk = createAsyncThunk(
  'profile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const data = await addressService.createAddress(addressData)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateAddressThunk = createAsyncThunk(
  'profile/updateAddress',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await addressService.updateAddress(id, data)
      return response
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const deleteAddressThunk = createAsyncThunk(
  'profile/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const setDefaultAddressThunk = createAsyncThunk(
  'profile/setDefaultAddress',
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await addressService.setDefaultAddress(id, addressData)
      return { id, address: response }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchOrdersThunk = createAsyncThunk(
  'profile/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrders(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchOrderDetailsThunk = createAsyncThunk(
  'profile/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrderById(orderId)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ───────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload }
    },
    updatePreferences(state, action) {
      state.preferences = { ...state.preferences, ...action.payload }
      try {
        localStorage.setItem('platemate_preferences', JSON.stringify(state.preferences))
      } catch {}
    },
    clearProfileError(state, action) {
      const key = action.payload || 'profile'
      if (state.error[key]) {
        state.error[key] = null
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading.profile = true
        state.error.profile = null
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading.profile = false
        state.profile = action.payload
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading.profile = false
        state.error.profile = action.payload
      })

    // Update Profile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading.updateProfile = true
        state.error.updateProfile = null
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading.updateProfile = false
        state.profile = { ...state.profile, ...action.payload }
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading.updateProfile = false
        state.error.updateProfile = action.payload
      })

    // Change Password
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading.passwordChange = true
        state.error.passwordChange = null
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading.passwordChange = false
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading.passwordChange = false
        state.error.passwordChange = action.payload
      })

    // Fetch Addresses
    builder
      .addCase(fetchAddressesThunk.pending, (state) => {
        state.loading.addresses = true
        state.error.addresses = null
      })
      .addCase(fetchAddressesThunk.fulfilled, (state, action) => {
        state.loading.addresses = false
        state.addresses = action.payload
      })
      .addCase(fetchAddressesThunk.rejected, (state, action) => {
        state.loading.addresses = false
        state.error.addresses = action.payload
      })

    // Add Address
    builder
      .addCase(addAddressThunk.pending, (state) => {
        state.loading.addressAction = true
      })
      .addCase(addAddressThunk.fulfilled, (state, action) => {
        state.loading.addressAction = false
        const newAddress = action.payload
        if (newAddress.isDefault) {
          state.addresses = state.addresses.map((a) => ({ ...a, isDefault: false }))
        }
        state.addresses.push(newAddress)
      })
      .addCase(addAddressThunk.rejected, (state) => {
        state.loading.addressAction = false
      })

    // Update Address
    builder
      .addCase(updateAddressThunk.pending, (state) => {
        state.loading.addressAction = true
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.loading.addressAction = false
        const updated = action.payload
        state.addresses = state.addresses.map((addr) => {
          if (updated.isDefault && addr.id !== updated.id) {
            return { ...addr, isDefault: false }
          }
          return addr.id === updated.id ? updated : addr
        })
      })
      .addCase(updateAddressThunk.rejected, (state) => {
        state.loading.addressAction = false
      })

    // Delete Address
    builder
      .addCase(deleteAddressThunk.pending, (state) => {
        state.loading.addressAction = true
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.loading.addressAction = false
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload)
      })
      .addCase(deleteAddressThunk.rejected, (state) => {
        state.loading.addressAction = false
      })

    // Set Default Address
    builder
      .addCase(setDefaultAddressThunk.pending, (state) => {
        state.loading.addressAction = true
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.loading.addressAction = false
        const { id } = action.payload
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      })
      .addCase(setDefaultAddressThunk.rejected, (state) => {
        state.loading.addressAction = false
      })

    // Fetch Orders
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading.orders = true
        state.error.orders = null
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading.orders = false
        if (Array.isArray(action.payload)) {
          state.orders.list = action.payload
        } else {
          state.orders.list = action.payload.orders || action.payload.data || []
          state.orders.meta = action.payload.meta || state.orders.meta
        }
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading.orders = false
        state.error.orders = action.payload
      })

    // Fetch Order Details
    builder
      .addCase(fetchOrderDetailsThunk.pending, (state) => {
        state.loading.orderDetails = true
        state.error.orderDetails = null
      })
      .addCase(fetchOrderDetailsThunk.fulfilled, (state, action) => {
        state.loading.orderDetails = false
        state.activeOrder = action.payload
      })
      .addCase(fetchOrderDetailsThunk.rejected, (state, action) => {
        state.loading.orderDetails = false
        state.error.orderDetails = action.payload
      })

    // Clear all profile state on logout to prevent stale role data leaking
    builder.addCase(logout, () => ({
      ...initialState,
      preferences: getSavedPreferences() || defaultPreferences,
    }))
  },
})

export const { setProfile, updatePreferences, clearProfileError } = profileSlice.actions
export default profileSlice.reducer
