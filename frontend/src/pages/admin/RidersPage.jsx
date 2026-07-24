/**
 * RidersPage.jsx — Delivery Rider Management & Verification Page (Phase F4)
 */

import { useEffect, useState } from 'react'
import useUsers from '../../hooks/useUsers.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import RiderTable from '../../components/admin/riders/RiderTable.jsx'
import RiderDetailsDrawer from '../../components/admin/riders/RiderDetailsDrawer.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function RidersPage() {
  const { riders, loading, fetchRiders, updateUserStatus } = useUsers()
  const [search, setSearch] = useState('')
  const [selectedRider, setSelectedRider] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchRiders({ search })
  }, [fetchRiders, search])

  const handleApprove = (riderId) => {
    updateUserStatus(riderId, 'VERIFIED')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Delivery Riders Directory</h1>
        <p className="text-xs text-slate-400">Verify rider vehicles, driver licenses, and background status</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search riders..." />
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-64" />
      ) : (
        <RiderTable
          riders={riders?.items || []}
          onViewDetails={(rd) => {
            setSelectedRider(rd)
            setDrawerOpen(true)
          }}
          onApprove={handleApprove}
          onSuspend={(id) => updateUserStatus(id, 'SUSPENDED')}
        />
      )}

      <RiderDetailsDrawer
        rider={selectedRider}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApprove={handleApprove}
      />
    </div>
  )
}
