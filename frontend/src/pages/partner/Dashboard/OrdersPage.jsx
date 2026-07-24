/**
 * OrdersPage.jsx — Live Partner Orders Management Page (/partner/orders)
 */

import { useEffect, useState, useMemo } from 'react'
import OrdersTable from '../../../components/partner/OrdersTable.jsx'
import OrderDetailsDrawer from '../../../components/partner/OrderDetailsDrawer.jsx'
import SearchBar from '../../../components/partner/SearchBar.jsx'
import FilterBar from '../../../components/partner/FilterBar.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import usePartnerOrders from '../../../hooks/usePartnerOrders.js'

const STATUS_FILTERS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function OrdersPage() {
  const { orders, activeOrder, loading, fetchOrders, updateOrderStatus, selectOrder } = usePartnerOrders()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    fetchOrders().catch(() => {})
  }, [fetchOrders])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderIdStr = (o.orderNumber || o.id || '').toLowerCase()
      const customerNameStr = (o.user?.name || o.customerName || '').toLowerCase()
      const matchesSearch = orderIdStr.includes(searchQuery.toLowerCase()) || customerNameStr.includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || o.status?.toUpperCase() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const handleOpenDetails = (order) => {
    selectOrder(order)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-extrabold text-gray-900">Live Partner Orders</h2>
        <p className="text-sm text-gray-500">Monitor incoming delivery orders and update kitchen preparation status in real-time</p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by Order ID or Customer..." />
        <FilterBar options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Skeleton variant="card" className="h-64" count={2} />
      )}

      {/* Orders Table */}
      {!loading && (
        <OrdersTable
          orders={filteredOrders}
          onSelectOrder={handleOpenDetails}
          onUpdateStatus={updateOrderStatus}
          loading={loading}
        />
      )}

      {/* Order Details Slide-Over Drawer */}
      <OrderDetailsDrawer
        order={activeOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={updateOrderStatus}
        loading={loading}
      />
    </div>
  )
}
