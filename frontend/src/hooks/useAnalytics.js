/**
 * useAnalytics.js — Custom Hook for Admin Analytics & Data Visualization (Phase F4)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import adminService from '../services/admin.service.js'
import { fetchAdminAnalyticsThunk } from '../store/slices/adminSlice.js'

export function useAnalytics() {
  const dispatch = useDispatch()
  const { analytics, loading } = useSelector((state) => state.admin)

  const fetchAnalytics = useCallback(async (params = {}) => {
    try {
      return await dispatch(fetchAdminAnalyticsThunk(params)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to load analytics data')
    }
  }, [dispatch])

  const exportReport = async (reportType) => {
    try {
      await adminService.exportData(reportType, 'csv')
      toast.success(`${reportType.toUpperCase()} report exported`)
    } catch (_err) {
      toast.error(`Export failed for ${reportType}`)
    }
  }

  return {
    analytics,
    loading: loading.analytics,
    fetchAnalytics,
    exportReport,
  }
}

export default useAnalytics
