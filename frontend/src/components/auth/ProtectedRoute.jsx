/**
 * ProtectedRoute.jsx — Route Guard for Authenticated Users with RBAC Authorization
 */

import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProfileThunk } from '../../store/slices/profileSlice.js'
import { getDashboardRoute } from '../../utils/constants.js'
import Skeleton from '../ui/Skeleton.jsx'

/**
 * Check if the user's role satisfies the allowed roles.
 * Handles role aliases:
 * - CUSTOMER
 * - PARTNER / RESTAURANT
 * - RIDER / DELIVERY
 * - ADMIN (has access to all routes)
 */
function isRoleAuthorized(userRole, allowedRoles) {
  if (!allowedRoles) return true
  if (!userRole) return false

  const normUserRole = userRole.toUpperCase()
  if (normUserRole === 'ADMIN') return true

  const allowedList = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map((r) => r.toUpperCase())

  return allowedList.some((allowed) => {
    if (allowed === normUserRole) return true
    if ((allowed === 'PARTNER' || allowed === 'RESTAURANT') && (normUserRole === 'PARTNER' || normUserRole === 'RESTAURANT')) return true
    if ((allowed === 'RIDER' || allowed === 'DELIVERY') && (normUserRole === 'RIDER' || normUserRole === 'DELIVERY')) return true
    return false
  })
}

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, user, isInitialized } = useSelector((state) => state.auth)
  const { profile, loading } = useSelector((state) => state.profile)

  const token = localStorage.getItem('accessToken')
  const activeUser = profile || user
  const userRole = activeUser?.role

  useEffect(() => {
    if ((isAuthenticated || token) && !profile && !loading.profile) {
      dispatch(fetchProfileThunk())
    }
  }, [dispatch, isAuthenticated, token, profile, loading.profile])

  // Show loading skeleton while initial auth or profile check is resolving
  if ((!isInitialized && token) || (token && !activeUser && loading.profile)) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto pt-24 min-h-screen">
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="text" count={3} />
      </div>
    )
  }

  // Check if authenticated
  if (!isAuthenticated && !token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // Check role authorization if specified
  if (allowedRoles && userRole) {
    const roleAuthorized = isRoleAuthorized(userRole, allowedRoles)

    if (!roleAuthorized) {
      const targetHome = getDashboardRoute(userRole)
      // Redirect tab automatically to user's valid role dashboard to prevent portal state leakage
      return <Navigate to={targetHome} replace />
    }
  }

  return children
}
