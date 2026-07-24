/**
 * DeliveryHistoryPage.jsx — Historical Delivery Archive Page (/rider/history)
 */

import { useEffect, useState } from 'react'
import useDeliveries from '../../hooks/useDeliveries.js'
import DeliveryStatusBadge from '../../components/rider/deliveries/DeliveryStatusBadge.jsx'
import SearchBar from '../../components/ui/SearchBar.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { FiCalendar } from 'react-icons/fi'

export default function DeliveryHistoryPage() {
  const { history, historyPagination, loading, loadHistory } = useDeliveries()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadHistory({ page: currentPage, limit: 10, search: searchQuery }).catch(() => {})
  }, [currentPage, searchQuery, loadHistory])

  const handleSearch = (q) => {
    setSearchQuery(q)
    setCurrentPage(1)
  }

  if (loading && history.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-16" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Delivery History</h1>
          <p className="text-xs text-gray-500 font-medium">Review all completed and past delivery assignments.</p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72">
          <SearchBar
            placeholder="Search order number or customer..."
            onSearch={handleSearch}
            value={searchQuery}
          />
        </div>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-2">
          <div className="text-5xl">📦</div>
          <h3 className="font-extrabold text-base text-gray-900">No Delivery Logs Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You have not completed any deliveries matching your search criteria yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((order) => {
            const restaurantName = order.restaurant?.name || order.restaurantName || 'Restaurant'
            const customerName = order.user?.name || order.customerName || 'Customer'
            const deliveredTime = order.deliveredAt
              ? new Date(order.deliveredAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Completed'

            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gray-900">#{order.orderNumber || 'ORD-9821'}</span>
                    <DeliveryStatusBadge status={order.status || 'DELIVERED'} />
                  </div>
                  <div className="text-xs text-gray-500 font-semibold flex items-center gap-3">
                    <span>{restaurantName} → {customerName}</span>
                  </div>
                  <span className="text-[0.65rem] text-gray-400 font-medium flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" /> {deliveredTime}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-[0.65rem] font-bold text-gray-400 uppercase block">Trip Earnings</span>
                    <span className="text-base font-black text-emerald-600">₹{order.deliveryFee || 50}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {historyPagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={historyPagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
