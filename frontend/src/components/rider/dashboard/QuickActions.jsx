/**
 * QuickActions.jsx — Rider Dashboard Quick Action Shortcuts (Phase F3)
 */

import { Link } from 'react-router-dom'
import { FiPackage, FiDollarSign, FiTruck, FiUser, FiTrendingUp, FiActivity } from 'react-icons/fi'

export default function QuickActions() {
  const actions = [
    { label: 'Active Queue', path: '/rider/deliveries', icon: FiPackage, color: 'text-orange-600 bg-orange-50' },
    { label: 'Earnings', path: '/rider/earnings', icon: FiDollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Performance', path: '/rider/performance', icon: FiTrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Vehicle Info', path: '/rider/vehicle', icon: FiTruck, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'My Profile', path: '/rider/profile', icon: FiUser, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
      <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
        <FiActivity className="w-4 h-4 text-orange-500" />
        <span>Quick Shortcuts</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon
          return (
            <Link
              key={idx}
              to={act.path}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-xs transition-all text-center group cursor-pointer"
            >
              <div className={`p-3 rounded-xl ${act.color} mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                {act.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
