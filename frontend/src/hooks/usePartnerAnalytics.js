/**
 * usePartnerAnalytics.js — Custom Hook for Partner Restaurant Analytics
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPartnerAnalyticsThunk } from '../store/slices/partnerSlice.js'

export function usePartnerAnalytics() {
  const dispatch = useDispatch()
  const { analytics, loading, error } = useSelector((state) => state.partner)

  const fetchAnalytics = useCallback(
    async (range = 'month') => {
      try {
        const result = await dispatch(fetchPartnerAnalyticsThunk(range)).unwrap()
        return result
      } catch (_err) {
        return null
      }
    },
    [dispatch]
  )

  return {
    analytics: analytics || {},
    loadingAnalytics: Boolean(loading?.analytics),
    error: error?.analytics || null,
    fetchAnalytics,
  }
}

export default usePartnerAnalytics
