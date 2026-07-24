/**
 * UsersPage.jsx — Unified User Management Directory (Phase F4)
 */

import { useEffect, useState } from 'react'
import useUsers from '../../hooks/useUsers.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import FilterBar from '../../components/admin/common/FilterBar.jsx'
import BulkActionsToolbar from '../../components/admin/common/BulkActionsToolbar.jsx'
import UserTable from '../../components/admin/users/UserTable.jsx'
import UserDetailsDrawer from '../../components/admin/users/UserDetailsDrawer.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function UsersPage() {
  const {
    users,
    selectedUserIds,
    selectedUser,
    loading,
    fetchUsers,
    updateUserStatus,
    bulkUpdateStatus,
    selectUser,
    toggleSelectUser,
    selectAllUsers,
    clearSelection,
  } = useUsers()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchUsers({ search, role: roleFilter !== 'ALL' ? roleFilter : undefined })
  }, [fetchUsers, search, roleFilter])

  const FILTER_OPTIONS = [
    { label: 'All Roles', value: 'ALL' },
    { label: 'Customers', value: 'CUSTOMER' },
    { label: 'Partners', value: 'PARTNER' },
    { label: 'Riders', value: 'RIDER' },
    { label: 'Admins', value: 'ADMIN' },
  ]

  const handleOpenDrawer = (user) => {
    selectUser(user)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">User Directory & Roles</h1>
          <p className="text-xs text-slate-400">Manage customers, partners, riders, and administrators</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, phone..." />
        <FilterBar options={FILTER_OPTIONS} selected={roleFilter} onChange={setRoleFilter} />
      </div>

      <BulkActionsToolbar
        selectedCount={selectedUserIds.length}
        onApprove={() => bulkUpdateStatus('ACTIVE')}
        onSuspend={() => bulkUpdateStatus('SUSPENDED')}
        onClear={clearSelection}
      />

      {loading ? (
        <Skeleton variant="card" className="h-64" />
      ) : (
        <UserTable
          users={users?.items || []}
          selectedUserIds={selectedUserIds}
          onToggleSelect={toggleSelectUser}
          onSelectAll={selectAllUsers}
          onViewDetails={handleOpenDrawer}
          onUpdateStatus={updateUserStatus}
        />
      )}

      <UserDetailsDrawer
        user={selectedUser}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateStatus={updateUserStatus}
      />
    </div>
  )
}
