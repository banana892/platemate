/**
 * useAdminDashboard.js — Custom Hook for Admin Dashboard KPIs & Real-Time Socket Connection (Phase F4)
 */

import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import socketService from '../services/socket.service.js'
import {
  fetchAdminDashboardThunk,
  fetchOperationalAlertsThunk,
  performGlobalSearchThunk,
  setSubRole,
  handleSocketNotification,
  handleSocketOrderUpdate,
} from '../store/slices/adminSlice.js'

export function useAdminDashboard() {
  const dispatch = useDispatch()
  const {
    currentSubRole,
    dashboardData,
    globalSearchResults,
    operationalAlerts,
    loading,
    errors,
  } = useSelector((state) => state.admin)

  const fetchDashboard = useCallback(async () => {
    try {
      await dispatch(fetchAdminDashboardThunk()).unwrap()
      await dispatch(fetchOperationalAlertsThunk()).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to refresh dashboard')
    }
  }, [dispatch])

  const searchGlobal = useCallback(async (query) => {
    try {
      await dispatch(performGlobalSearchThunk(query)).unwrap()
    } catch (err) {
      console.error('Search error:', err)
    }
  }, [dispatch])

  const changeSubRole = (role) => {
    dispatch(setSubRole(role))
    toast.success(`Switched administrative view to ${role.replace(/_/g, ' ')}`)
  }

  // Socket listener setup for admin
  useEffect(() => {
    socketService.connect()
    
    const onAdminNotification = (data) => {
      dispatch(handleSocketNotification(data))
      toast(data.title || 'New Admin Notification', { icon: '🔔' })
    }

    const onDashboardRefresh = () => {
      fetchDashboard()
    }

    const onOrderUpdate = (order) => {
      dispatch(handleSocketOrderUpdate(order))
    }

    socketService.on('admin:notification', onAdminNotification)
    socketService.on('admin:dashboard-refresh', onDashboardRefresh)
    socketService.on('order:updated', onOrderUpdate)

    return () => {
      socketService.off('admin:notification')
      socketService.off('admin:dashboard-refresh')
      socketService.off('order:updated')
    }
  }, [dispatch, fetchDashboard])

  return {
    currentSubRole,
    dashboardData,
    globalSearchResults,
    operationalAlerts,
    loading: loading.dashboard,
    searchLoading: loading.search,
    error: errors.dashboard,
    fetchDashboard,
    searchGlobal,
    changeSubRole,
  }
}

export default useAdminDashboard
