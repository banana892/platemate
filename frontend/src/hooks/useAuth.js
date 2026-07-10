import { useSelector, useDispatch } from 'react-redux'
import { loginSuccess, logout as logoutAction } from '../store/slices/authSlice.js'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading } = useSelector(state => state.auth)

  const login = (userData) => {
    dispatch(loginSuccess(userData))
  }

  const logout = () => {
    dispatch(logoutAction())
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}
