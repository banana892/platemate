/**
 * useSystemHealth.js — Custom Hook for Admin System Health & Feature Flags (Phase F4)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import systemService from '../services/system.service.js'
import adminService from '../services/admin.service.js'
import {
  fetchSystemHealthThunk,
  fetchFeatureFlagsThunk,
  fetchAuditLogsThunk,
  fetchSettingsThunk,
  updateFeatureFlagLocal,
} from '../store/slices/adminSlice.js'

export function useSystemHealth() {
  const dispatch = useDispatch()
  const { systemHealth, featureFlags, auditLogs, settings } = useSelector((state) => state.admin)

  const fetchHealth = useCallback(async () => {
    try {
      await dispatch(fetchSystemHealthThunk()).unwrap()
    } catch (_err) {
      toast.error('Failed to load system health')
    }
  }, [dispatch])

  const fetchFlags = useCallback(async () => {
    try {
      await dispatch(fetchFeatureFlagsThunk()).unwrap()
    } catch (_err) {
      toast.error('Failed to load feature flags')
    }
  }, [dispatch])

  const fetchLogs = useCallback(async (params = {}) => {
    try {
      await dispatch(fetchAuditLogsThunk(params)).unwrap()
    } catch (_err) {
      toast.error('Failed to load audit logs')
    }
  }, [dispatch])

  const fetchSettings = useCallback(async () => {
    try {
      await dispatch(fetchSettingsThunk()).unwrap()
    } catch (_err) {
      toast.error('Failed to load settings')
    }
  }, [dispatch])

  const toggleFeatureFlag = async (flagName, enabled) => {
    dispatch(updateFeatureFlagLocal({ flagName, enabled }))
    try {
      await systemService.updateFeatureFlag(flagName, enabled)
      toast.success(`Feature flag "${flagName}" updated to ${enabled ? 'ENABLED' : 'DISABLED'}`)
    } catch (_err) {
      toast.error('Failed to update feature flag')
      dispatch(updateFeatureFlagLocal({ flagName, enabled: !enabled }))
    }
  }

  const updateSettings = async (data) => {
    try {
      await adminService.updateSettings(data)
      toast.success('Platform settings updated successfully')
      fetchSettings()
    } catch (_err) {
      toast.error('Failed to update platform settings')
    }
  }

  return {
    systemHealth,
    featureFlags,
    auditLogs,
    settings,
    fetchHealth,
    fetchFlags,
    fetchLogs,
    fetchSettings,
    toggleFeatureFlag,
    updateSettings,
  }
}

export default useSystemHealth
