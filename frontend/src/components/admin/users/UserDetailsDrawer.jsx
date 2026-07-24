/**
 * UserDetailsDrawer.jsx — Deep User Profile Drawer Component (Phase F4)
 */

import { FiX, FiMail, FiPhone, FiCalendar, FiSlash, FiCheckCircle } from 'react-icons/fi'
import RoleBadge from './RoleBadge.jsx'
import StatusBadge from './StatusBadge.jsx'

export default function UserDetailsDrawer({ user, isOpen, onClose, onUpdateStatus }) {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-lg">
                {user.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">{user.name}</h3>
                <p className="text-xs text-slate-500 font-mono">User ID: {user.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Badges & Status */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Account Role</div>
                <RoleBadge role={user.role} subRole={user.subRole} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current Status</div>
                <StatusBadge status={user.status} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Information</div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiMail className="text-amber-400 text-base shrink-0" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiPhone className="text-amber-400 text-base shrink-0" />
                <span>{user.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiCalendar className="text-amber-400 text-base shrink-0" />
                <span>Registered on {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Role Specific Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Total Orders / Activity</div>
                <div className="text-lg font-black text-amber-400 mt-1">{user.ordersCount || 14}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Total Volume Spent</div>
                <div className="text-lg font-black text-emerald-400 mt-1">${user.totalSpent || 340.50}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrative Controls</div>
              {user.status === 'ACTIVE' ? (
                <button
                  onClick={() => {
                    onUpdateStatus(user.id, 'SUSPENDED')
                    onClose()
                  }}
                  className="w-full py-3 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <FiSlash /> Suspend Account
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUpdateStatus(user.id, 'ACTIVE')
                    onClose()
                  }}
                  className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <FiCheckCircle /> Activate Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
