/**
 * useDeliveries.js — Custom Hook for Active & Historical Deliveries (Phase F3)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchActiveDeliveries,
  fetchDeliveryById,
  updateDeliveryStatus,
  fetchDeliveryHistory,
} from '../store/slices/riderSlice.js'

export function useDeliveries() {
  const dispatch = useDispatch()
  const {
    activeDeliveries,
    selectedDelivery,
    history,
    historyPagination,
    loading,
    actionLoading,
    error,
  } = useSelector((state) => state.rider)

  const loadActiveDeliveries = useCallback(
    (params) => {
      return dispatch(fetchActiveDeliveries(params)).unwrap()
    },
    [dispatch]
  )

  const loadDeliveryDetails = useCallback(
    (id) => {
      return dispatch(fetchDeliveryById(id)).unwrap()
    },
    [dispatch]
  )

  const changeDeliveryStatus = useCallback(
    (id, status) => {
      return dispatch(updateDeliveryStatus({ id, status })).unwrap()
    },
    [dispatch]
  )

  const loadHistory = useCallback(
    (params) => {
      return dispatch(fetchDeliveryHistory(params)).unwrap()
    },
    [dispatch]
  )

  return {
    activeDeliveries,
    selectedDelivery,
    history,
    historyPagination,
    loading,
    actionLoading,
    error,
    loadActiveDeliveries,
    loadDeliveryDetails,
    changeDeliveryStatus,
    loadHistory,
  }
}

export default useDeliveries
