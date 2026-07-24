import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/auth.service.js'
import userService from '../../services/user.service.js'
import { incrementAuthSessionId } from '../../services/api.js'
import { broadcastAuthLogin } from '../../utils/authTabSync.js'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
}

// ── Async Thunks ────────────────────────────────────────────────────────────

export const checkAuthThunk = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('No session')
    }
    try {
      const user = await authService.getMe()
      return user
    } catch (err) {
      localStorage.removeItem('accessToken')
      return rejectWithValue(err.message || 'Session expired')
    }
  }
)

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)
      // data = { user, accessToken } after service unwrapping
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        broadcastAuthLogin(data.user || data)
      }
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const user = await authService.register(userData)
      return user
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed')
    }
  }
)

export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.googleLogin(payload)
      // data = { user, accessToken } after service unwrapping
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        broadcastAuthLogin(data.user || data)
      }
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Google authentication failed')
    }
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async (allDevices = false, { dispatch }) => {
    try {
      if (allDevices) {
        await authService.logoutAll()
      } else {
        await authService.logout()
      }
    } finally {
      localStorage.removeItem('accessToken')
      dispatch(logout())
    }
  }
)

export const deleteAccountThunk = createAsyncThunk(
  'auth/deleteAccount',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const result = await userService.deleteAccount(payload)
      dispatch(logout())
      return result
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Account deletion failed')
    }
  }
)

// ── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true
      state.error = null
    },
    loginSuccess(state, action) {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload
    },
    loginFailure(state, action) {
      state.isLoading = false
      state.error = action.payload
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    updateProfile(state, action) {
      state.user = { ...state.user, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Check Auth
    builder
      .addCase(checkAuthThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.isInitialized = true
        state.user = action.payload
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.isInitialized = true
        state.user = null
      })

    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        incrementAuthSessionId()
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user || action.payload
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Google Login
    builder
      .addCase(googleLoginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        incrementAuthSessionId()
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user || action.payload
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions
export default authSlice.reducer
