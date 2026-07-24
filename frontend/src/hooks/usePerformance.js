/**
 * usePerformance.js — Custom Hook for Rider Performance & Analytics (Phase F3)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAnalytics } from '../store/slices/riderSlice.js'

export function usePerformance() {
  const dispatch = useDispatch()
  const { analytics, loading, error } = useSelector((state) => state.rider)

  const loadAnalytics = useCallback(
    (params = {}) => {
      return dispatch(fetchAnalytics(params)).unwrap()
    },
    [dispatch]
  )

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
  }
}

export default usePerformance
