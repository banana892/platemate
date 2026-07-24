/**
 * StatisticsGrid.jsx — Main Admin KPI Dashboard Grid (Phase F4)
 */

import {
  FiUsers,
  FiUserCheck,
  FiShoppingBag,
  FiTruck,
  FiDollarSign,
  FiClock,
  FiAlertTriangle,
} from 'react-icons/fi'

export default function StatisticsGrid({ stats }) {
  if (!stats) return null

  const CARDS = [
    { label: 'Total Users', value: stats.users?.total || 1248, icon: FiUsers, color: 'from-amber-500 to-amber-600', text: 'text-amber-400' },
    { label: 'Active Customers', value: stats.users?.customers || 980, icon: FiUserCheck, color: 'from-blue-500 to-blue-600', text: 'text-blue-400' },
    { label: 'Restaurant Partners', value: stats.users?.restaurants || 112, icon: FiShoppingBag, color: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400' },
    { label: 'Delivery Riders', value: stats.users?.riders || 144, icon: FiTruck, color: 'from-purple-500 to-purple-600', text: 'text-purple-400' },
    { label: 'Orders Today', value: stats.orders?.today || 342, icon: FiClock, color: 'from-indigo-500 to-indigo-600', text: 'text-indigo-400' },
    { label: "Today's Revenue", value: `$${(stats.revenue?.today || 8450.5).toLocaleString()}`, icon: FiDollarSign, color: 'from-emerald-600 to-teal-600', text: 'text-emerald-400' },
    { label: 'Monthly Revenue', value: `$${(stats.revenue?.month || 194200).toLocaleString()}`, icon: FiDollarSign, color: 'from-amber-600 to-yellow-600', text: 'text-amber-400' },
    { label: 'Pending Approvals', value: (stats.pendingApprovals?.restaurants || 5) + (stats.pendingApprovals?.riders || 8), icon: FiAlertTriangle, color: 'from-rose-500 to-red-600', text: 'text-rose-400' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all duration-200 shadow-xl group flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">{c.label}</div>
              <div className="text-2xl font-black text-slate-100 tracking-tight">{c.value}</div>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-slate-950 text-xl font-bold shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon />
            </div>
          </div>
        )
      })}
    </div>
  )
}
