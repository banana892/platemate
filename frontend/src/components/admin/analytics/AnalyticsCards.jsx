/**
 * AnalyticsCards.jsx — High-Level Financial & Operational Analytics Summary Cards (Phase F4)
 */

import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi'

export default function AnalyticsCards() {
  const METRICS = [
    { label: 'Gross Merchandise Value (GMV)', value: '$194,200.00', trend: '+14.2%', icon: FiDollarSign, color: 'text-emerald-400' },
    { label: 'Platform Net Take Rate', value: '15.0%', trend: '+0.5%', icon: FiTrendingUp, color: 'text-amber-400' },
    { label: 'Avg Order Value (AOV)', value: '$38.50', trend: '+3.1%', icon: FiShoppingBag, color: 'text-indigo-400' },
    { label: 'Active Monthly Customers', value: '2,840', trend: '+18.6%', icon: FiUsers, color: 'text-purple-400' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((m, i) => {
        const Icon = m.icon
        return (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">{m.label}</span>
              <Icon className={`text-lg ${m.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-100 tracking-tight">{m.value}</div>
            <div className="text-xs font-bold text-emerald-400 mt-1">{m.trend} vs last month</div>
          </div>
        )
      })}
    </div>
  )
}
