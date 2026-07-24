/**
 * useRider.js — Custom Hook for Rider Profile & Availability (Phase F3)
 */

import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRiderDashboard,
  fetchRiderProfile,
  updateRiderProfile,
  fetchRiderStatus,
  updateRiderStatus,
  incrementShiftTime,
  clearRiderError,
} from '../store/slices/riderSlice.js'

export function useRider() {
  const dispatch = useDispatch()
  const {
    profile,
    status,
    shift,
    dashboard,
    notifications,
    unreadNotificationsCount,
    loading,
    actionLoading,
    error,
  } = useSelector((state) => state.rider)

  // Shift duration ticker
  useEffect(() => {
    let timer = null
    if (shift.isActive) {
      timer = setInterval(() => {
        dispatch(incrementShiftTime())
      }, 60000) // update every minute
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [shift.isActive, dispatch])

  const loadDashboard = useCallback(() => {
    return dispatch(fetchRiderDashboard()).unwrap()
  }, [dispatch])

  const loadProfile = useCallback(() => {
    return dispatch(fetchRiderProfile()).unwrap()
  }, [dispatch])

  const editProfile = useCallback(
    (data) => {
      return dispatch(updateRiderProfile(data)).unwrap()
    },
    [dispatch]
  )

  const loadStatus = useCallback(() => {
    return dispatch(fetchRiderStatus()).unwrap()
  }, [dispatch])

  const changeStatus = useCallback(
    (newStatus) => {
      return dispatch(updateRiderStatus(newStatus)).unwrap()
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearRiderError())
  }, [dispatch])

  return {
    profile,
    status,
    shift,
    dashboard,
    notifications,
    unreadNotificationsCount,
    loading,
    actionLoading,
    error,
    loadDashboard,
    loadProfile,
    editProfile,
    loadStatus,
    changeStatus,
    clearError,
  }
}

export default useRider
