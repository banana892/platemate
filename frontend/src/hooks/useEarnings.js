/**
 * useEarnings.js — Custom Hook for Rider Earnings (Phase F3)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEarnings } from '../store/slices/riderSlice.js'

export function useEarnings() {
  const dispatch = useDispatch()
  const { earnings, loading, error } = useSelector((state) => state.rider)

  const loadEarnings = useCallback(
    (params = {}) => {
      return dispatch(fetchEarnings(params)).unwrap()
    },
    [dispatch]
  )

  return {
    earnings,
    loading,
    error,
    loadEarnings,
  }
}

export default useEarnings
