/**
 * OrderHistoryPage.jsx — Customer Order History Listing (/profile/orders)
 */

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import OrderCard from '../../../components/customer/OrderCard.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import { fetchOrdersThunk } from '../../../store/slices/profileSlice.js'

export default function OrderHistoryPage() {
  const dispatch = useDispatch()
  const { orders, loading, error } = useSelector((state) => state.profile)

  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const orderList = Array.isArray(orders?.list) ? orders.list : []
  const meta = orders?.meta || {}
  const totalPages = meta?.totalPages || Math.ceil((meta?.total || 0) / (meta?.limit || 6)) || 1
  const isLoading = loading?.orders
  const errorMessage = error?.orders

  useEffect(() => {
    dispatch(fetchOrdersThunk({ page, limit: 6, status: statusFilter || undefined }))
  }, [dispatch, page, statusFilter])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Order History</h2>
          <p className="text-sm text-gray-500">Track and review all your food deliveries</p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF4F5A] cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CONFIRMED">Active Orders</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Error State with Graceful Retry */}
      {errorMessage && !isLoading && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
          <div className="text-sm text-red-700 font-medium">
            Failed to load orders: {errorMessage}
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="flex items-center gap-2 text-xs font-bold text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-smooth cursor-pointer"
          >
            <FiRefreshCw /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-44" count={4} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && orderList.length === 0 && (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF4F5A] mx-auto flex items-center justify-center text-3xl mb-4">
            <FiShoppingBag />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            {statusFilter
              ? 'No orders match your selected status filter.'
              : "You haven't placed any orders yet. Explore nearby top-rated restaurants!"}
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth cursor-pointer"
          >
            <span>Explore Restaurants</span>
          </Link>
        </div>
      )}

      {/* Order Cards Grid */}
      {!isLoading && orderList.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderList.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
              <span className="text-xs font-semibold text-gray-500">
                Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-smooth cursor-pointer"
                  aria-label="Previous page"
                >
                  <FiChevronLeft className="text-base" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-smooth cursor-pointer"
                  aria-label="Next page"
                >
                  <FiChevronRight className="text-base" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
