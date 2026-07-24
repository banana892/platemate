/**
 * RestaurantsPage.jsx — Restaurant Moderation & Approvals Page (Phase F4)
 */

import { useEffect, useState } from 'react'
import useRestaurants from '../../hooks/useRestaurants.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import FilterBar from '../../components/admin/common/FilterBar.jsx'
import RestaurantTable from '../../components/admin/restaurants/RestaurantTable.jsx'
import RestaurantApprovalCard from '../../components/admin/restaurants/RestaurantApprovalCard.jsx'
import RestaurantDetailsDrawer from '../../components/admin/restaurants/RestaurantDetailsDrawer.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function RestaurantsPage() {
  const {
    restaurants,
    selectedRestaurant,
    loading,
    fetchRestaurants,
    approveRestaurant,
    rejectRestaurant,
    suspendRestaurant,
    selectRestaurant,
  } = useRestaurants()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchRestaurants({ search, status: statusFilter !== 'ALL' ? statusFilter : undefined })
  }, [fetchRestaurants, search, statusFilter])

  const pendingList = restaurants?.items?.filter((r) => r.status === 'PENDING') || []

  const FILTER_OPTIONS = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending Approvals', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Suspended', value: 'SUSPENDED' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Restaurant Moderation & Approvals</h1>
        <p className="text-xs text-slate-400">Review restaurant onboarding applications, menus, and health licenses</p>
      </div>

      {/* Pending Approvals Section */}
      {pendingList.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Pending Approval Queue ({pendingList.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingList.map((r) => (
              <RestaurantApprovalCard
                key={r.id}
                restaurant={r}
                onApprove={approveRestaurant}
                onReject={rejectRestaurant}
                onViewDetails={(rest) => {
                  selectRestaurant(rest)
                  setDrawerOpen(true)
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search restaurants..." />
        <FilterBar options={FILTER_OPTIONS} selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-64" />
      ) : (
        <RestaurantTable
          restaurants={restaurants?.items || []}
          onViewDetails={(r) => {
            selectRestaurant(r)
            setDrawerOpen(true)
          }}
          onApprove={approveRestaurant}
          onReject={rejectRestaurant}
          onSuspend={suspendRestaurant}
        />
      )}

      <RestaurantDetailsDrawer
        restaurant={selectedRestaurant}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApprove={approveRestaurant}
        onSuspend={suspendRestaurant}
      />
    </div>
  )
}
