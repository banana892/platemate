/**
 * useOrders.js — Custom Hook for Customer Order History & Details (Profile Section)
 *
 * Reads from state.profile (profileSlice), not state.admin.
 * Uses fetchOrdersThunk and fetchOrderDetailsThunk from profileSlice.
 *
 * Bug fix: The previous implementation was incorrectly wired to state.admin
 * and dispatched fetchAdminOrdersThunk (an admin-only operation). This caused
 * an intermittent React Error Boundary crash when navigating between Settings
 * tabs (Preferences / Notifications), because ProfileLayout calls useOrders()
 * on every mount to populate sidebar badge counts. The admin API call would
 * fail or return an unexpected payload shape for regular customer users,
 * and downstream null/undefined accesses in the component tree would crash
 * React into the Error Boundary ("Something went wrong"). A full page reload
 * temporarily fixed the crash because the clean initial Redux state prevented
 * the bad selector path from being reached before the correct data loaded.
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchOrdersThunk,
  fetchOrderDetailsThunk,
} from '../store/slices/profileSlice.js'

export function useOrders() {
  const dispatch = useDispatch()
  const { orders, activeOrder, loading, error } = useSelector((state) => state.profile)

  // orders.list is the paginated array stored in profileSlice
  const orderList = Array.isArray(orders?.list) ? orders.list : []

  const fetchOrders = useCallback(
    async (params = {}) => {
      try {
        return await dispatch(fetchOrdersThunk(params)).unwrap()
      } catch (err) {
        toast.error(err || 'Failed to load orders')
      }
    },
    [dispatch]
  )

  const fetchOrderDetails = useCallback(
    async (orderId) => {
      try {
        return await dispatch(fetchOrderDetailsThunk(orderId)).unwrap()
      } catch (err) {
        toast.error(err || 'Failed to load order details')
        throw err
      }
    },
    [dispatch]
  )

  return {
    // List & pagination — used by OrderHistoryPage, ProfilePage, ProfileLayout badge
    orders: orderList,
    ordersMeta: orders?.meta || {},
    loading: loading.orders,
    error: error.orders,

    // Single order detail — used by OrderDetailsPage
    activeOrder,
    loadingDetails: loading.orderDetails,
    errorDetails: error.orderDetails,

    fetchOrders,
    fetchOrderDetails,
  }
}

export default useOrders
