/**
 * UserTable.jsx — Multi-Select User Management Data Table (Phase F4)
 */

import RoleBadge from './RoleBadge.jsx'
import StatusBadge from './StatusBadge.jsx'
import { FiEye, FiSlash, FiCheckCircle } from 'react-icons/fi'

export default function UserTable({
  users = [],
  selectedUserIds = [],
  onToggleSelect,
  onSelectAll,
  onViewDetails,
  onUpdateStatus,
}) {
  const allSelected = users.length > 0 && selectedUserIds.length === users.length

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      onSelectAll(users.map((u) => u.id))
    } else {
      onSelectAll([])
    }
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
      <table className="w-full text-left border-collapse text-xs text-slate-200">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="p-3.5 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAllChange}
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
            </th>
            <th className="p-3.5">User Profile</th>
            <th className="p-3.5">Contact Details</th>
            <th className="p-3.5">System Role</th>
            <th className="p-3.5">Account Status</th>
            <th className="p-3.5">Joined Date</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {users.length > 0 ? (
            users.map((user) => {
              const isSelected = selectedUserIds.includes(user.id)
              return (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    isSelected ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(user.id)}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                    />
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{user.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div>{user.email}</div>
                    <div className="text-[11px] text-slate-400">{user.phone || 'N/A'}</div>
                  </td>
                  <td className="p-3.5">
                    <RoleBadge role={user.role} subRole={user.subRole} />
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(user)}
                        title="View Profile Details"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <FiEye className="text-base" />
                      </button>
                      {user.status === 'ACTIVE' ? (
                        <button
                          onClick={() => onUpdateStatus(user.id, 'SUSPENDED')}
                          title="Suspend Account"
                          className="p-1.5 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <FiSlash className="text-base" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(user.id, 'ACTIVE')}
                          title="Activate Account"
                          className="p-1.5 rounded-lg hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          <FiCheckCircle className="text-base" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
