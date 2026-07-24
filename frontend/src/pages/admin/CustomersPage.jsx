/**
 * CustomersPage.jsx — Customer Management Page (Phase F4)
 */

import { useEffect, useState } from 'react'
import useUsers from '../../hooks/useUsers.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import UserTable from '../../components/admin/users/UserTable.jsx'
import UserDetailsDrawer from '../../components/admin/users/UserDetailsDrawer.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function CustomersPage() {
  const { users, selectedUserIds, selectedUser, loading, fetchUsers, updateUserStatus, selectUser, toggleSelectUser, selectAllUsers } = useUsers()
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchUsers({ role: 'CUSTOMER', search })
  }, [fetchUsers, search])

  const customers = users?.items?.filter((u) => u.role === 'CUSTOMER') || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Customer Management</h1>
        <p className="text-xs text-slate-400">Monitor customer profiles, lifetime spending, and account statuses</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." />
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-64" />
      ) : (
        <UserTable
          users={customers}
          selectedUserIds={selectedUserIds}
          onToggleSelect={toggleSelectUser}
          onSelectAll={selectAllUsers}
          onViewDetails={(u) => {
            selectUser(u)
            setDrawerOpen(true)
          }}
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
