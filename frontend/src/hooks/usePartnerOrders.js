/**
 * usePartnerOrders.js — Custom Hook for Partner Order Management & Status Transitions
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchPartnerOrdersThunk,
  updateOrderStatusThunk,
  setActiveOrder,
} from '../store/slices/partnerSlice.js'

export function usePartnerOrders() {
  const dispatch = useDispatch()
  const { orders, activeOrder, loading, error } = useSelector((state) => state.partner)

  const fetchOrders = useCallback(
    async (params = {}) => {
      try {
        const result = await dispatch(fetchPartnerOrdersThunk(params)).unwrap()
        return result
      } catch (err) {
        toast.error(err || 'Failed to fetch orders')
        throw err
      }
    },
    [dispatch]
  )

  const updateOrderStatus = async (orderId, status, rejectionReason = '') => {
    try {
      await dispatch(updateOrderStatusThunk({ orderId, status, rejectionReason })).unwrap()
      toast.success(`Order status updated to ${status.replace(/_/g, ' ')}`)
    } catch (err) {
      toast.error(err || 'Failed to update order status')
      throw err
    }
  }

  const selectOrder = (order) => {
    dispatch(setActiveOrder(order))
  }

  return {
    orders,
    activeOrder,
    loading: loading.orders,
    actionLoading: loading.orderAction,
    error: error.orders,
    fetchOrders,
    updateOrderStatus,
    selectOrder,
  }
}

export default usePartnerOrders
