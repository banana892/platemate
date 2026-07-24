/**
 * useAdminOrders.js — Custom Hook for Admin Order Monitoring (Phase F4)
 *
 * Reads from state.admin and dispatches admin-only thunks.
 * Used exclusively by admin dashboard pages (/admin/orders and /admin/orders/:id).
 *
 * Note: The original useOrders.js was mistakenly shared between admin and
 * customer contexts. It has been renamed to useAdminOrders.js for admin use,
 * and useOrders.js has been corrected to read from the customer profile slice.
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import orderAdminService from '../services/order-admin.service.js'
import {
  fetchAdminOrdersThunk,
  setSelectedOrder,
} from '../store/slices/adminSlice.js'

export function useAdminOrders() {
  const dispatch = useDispatch()
  const { orders, selectedOrder, loading } = useSelector((state) => state.admin)

  const fetchOrders = useCallback(
    async (params = {}) => {
      try {
        return await dispatch(fetchAdminOrdersThunk(params)).unwrap()
      } catch (err) {
        toast.error(err || 'Failed to load orders')
      }
    },
    [dispatch]
  )

  const cancelOrder = async (id, reason) => {
    try {
      await orderAdminService.cancelOrder(id, reason)
      toast.success('Order cancelled successfully')
      fetchOrders()
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order')
    }
  }

  const selectOrder = async (idOrOrder) => {
    if (typeof idOrOrder === 'string') {
      try {
        const details = await orderAdminService.getOrderById(idOrOrder)
        dispatch(setSelectedOrder(details))
      } catch (_err) {
        toast.error('Failed to load order details')
      }
    } else {
      dispatch(setSelectedOrder(idOrOrder))
    }
  }

  return {
    orders,
    selectedOrder,
    loading: loading.orders,
    fetchOrders,
    cancelOrder,
    selectOrder,
  }
}

export default useAdminOrders
