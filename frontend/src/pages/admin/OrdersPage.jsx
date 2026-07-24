/**
 * OrdersPage.jsx — Real-Time Order Monitoring & Tracking Page (Phase F4)
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAdminOrders from '../../hooks/useAdminOrders.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import FilterBar from '../../components/admin/common/FilterBar.jsx'
import OrdersTable from '../../components/admin/orders/OrdersTable.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function OrdersPage() {
  const { orders, loading, fetchOrders, cancelOrder, selectOrder } = useAdminOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders({ search, status: statusFilter !== 'ALL' ? statusFilter : undefined })
  }, [fetchOrders, search, statusFilter])

  const FILTER_OPTIONS = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Placed', value: 'PLACED' },
    { label: 'Preparing', value: 'PREPARING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]

  const handleInspect = (o) => {
    selectOrder(o)
    navigate(`/admin/orders/${o.id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Platform Order Monitoring</h1>
        <p className="text-xs text-slate-400">Live order fulfillment monitoring and intervention</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, customer name..." />
        <FilterBar options={FILTER_OPTIONS} selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-64" />
      ) : (
        <OrdersTable
          orders={orders?.items || []}
          onViewDetails={handleInspect}
          onCancelOrder={cancelOrder}
        />
      )}
    </div>
  )
}
