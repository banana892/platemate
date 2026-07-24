/**
 * QuickActions.jsx — Admin Fast Operations Action Toolbar (Phase F4)
 */

import { useNavigate } from 'react-router-dom'
import {
  FiCheckSquare,
  FiTruck,
  FiSend,
  FiDownload,
  FiSliders,
  FiRefreshCw,
} from 'react-icons/fi'
import useAnalytics from '../../../hooks/useAnalytics.js'
import useAdminDashboard from '../../../hooks/useAdminDashboard.js'

export default function QuickActions() {
  const navigate = useNavigate()
  const { exportReport } = useAnalytics()
  const { fetchDashboard } = useAdminDashboard()

  const ACTIONS = [
    { label: 'Review Restaurants', icon: FiCheckSquare, onClick: () => navigate('/admin/restaurants'), color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' },
    { label: 'Verify Riders', icon: FiTruck, onClick: () => navigate('/admin/riders'), color: 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' },
    { label: 'Broadcast Alert', icon: FiSend, onClick: () => navigate('/admin/notifications'), color: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' },
    { label: 'Export Report', icon: FiDownload, onClick: () => exportReport('summary'), color: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' },
    { label: 'Platform Config', icon: FiSliders, onClick: () => navigate('/admin/settings'), color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20' },
    { label: 'Refresh Data', icon: FiRefreshCw, onClick: () => fetchDashboard(), color: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="text-sm font-bold text-slate-200 mb-3">Quick Administrative Actions</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon
          return (
            <button
              key={i}
              onClick={a.onClick}
              className={`p-3 rounded-xl border font-semibold text-xs flex flex-col items-center gap-2 transition-all ${a.color}`}
            >
              <Icon className="text-xl" />
              <span className="text-center">{a.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
