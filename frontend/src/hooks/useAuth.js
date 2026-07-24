import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  loginSuccess,
  logout as logoutAction,
  loginThunk,
  registerThunk,
  googleLoginThunk,
  checkAuthThunk,
  deleteAccountThunk,
} from '../store/slices/authSlice.js'
import authService from '../services/auth.service.js'
import { resetApiAuthState, incrementAuthSessionId } from '../services/api.js'
import { broadcastAuthLogin, broadcastAuthLogout } from '../utils/authTabSync.js'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, isInitialized, error } = useSelector(
    (state) => state.auth
  )

  const login = async (credentials) => {
    let result
    if (credentials?.email && credentials?.password) {
      result = await dispatch(loginThunk(credentials)).unwrap()
    } else {
      result = credentials
      dispatch(loginSuccess(result))
    }

    // Execute auth login side-effects outside Redux reducer
    incrementAuthSessionId()
    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken)
    }
    broadcastAuthLogin(result?.user || result)
    return result
  }

  const register = async (userData) => {
    return dispatch(registerThunk(userData)).unwrap()
  }

  const googleLogin = async (payload) => {
    const result = await dispatch(googleLoginThunk(payload)).unwrap()
    incrementAuthSessionId()
    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken)
    }
    broadcastAuthLogin(result?.user || result)
    return result
  }

  const logout = async (allDevices = false) => {
    // 1. Abort in-flight refresh, clear headers & increment session ID
    resetApiAuthState()

    // 2. Broadcast logout event to all other open tabs
    broadcastAuthLogout()

    // 3. Clear local storage access token and Redux auth state
    localStorage.removeItem('accessToken')
    dispatch(logoutAction())

    // 4. Perform backend token revocation & cookie clearing
    try {
      if (allDevices) {
        await authService.logoutAll()
      } else {
        await authService.logout()
      }
    } catch (err) {
      console.warn('Logout API warning:', err)
    }
  }

  const checkAuth = useCallback(async () => {
    return dispatch(checkAuthThunk()).unwrap()
  }, [dispatch])

  const deleteAccount = async (payload) => {
    return dispatch(deleteAccountThunk(payload)).unwrap()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    googleLogin,
    logout,
    checkAuth,
    deleteAccount,
  }
}

export default useAuth
