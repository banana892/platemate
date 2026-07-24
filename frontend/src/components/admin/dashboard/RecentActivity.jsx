/**
 * RecentActivity.jsx — Live Platform Activity Stream (Phase F4)
 */

import { FiActivity, FiUserPlus } from 'react-icons/fi'

export default function RecentActivity({ registrations = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-1">
        <FiActivity className="text-amber-400 text-lg" /> Live Registration Stream
      </div>
      <div className="text-xs text-slate-400 mb-4">Latest platform sign-ups</div>

      <div className="space-y-3">
        {registrations.length > 0 ? (
          registrations.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <FiUserPlus />
                </div>
                <div>
                  <div className="font-bold text-slate-200">{u.name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                {u.role}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">No recent registrations</div>
        )}
      </div>
    </div>
  )
}
