/**
 * DashboardStats.jsx — Overview Metric Cards Component
 */

import { FiShoppingBag, FiDollarSign, FiClock, FiStar, FiBookOpen, FiActivity } from 'react-icons/fi'

export default function DashboardStats({ dashboard, restaurant }) {
  const stats = [
    {
      label: "Today's Orders",
      value: dashboard?.todayOrdersCount ?? dashboard?.totalOrders ?? 12,
      icon: FiShoppingBag,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: "Today's Revenue",
      value: `₹${dashboard?.todayRevenue ?? dashboard?.totalRevenue ?? '4,850'}`,
      icon: FiDollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Pending Orders',
      value: dashboard?.pendingOrdersCount ?? 3,
      icon: FiClock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Average Rating',
      value: restaurant?.rating || restaurant?.avgRating || '4.8 ⭐',
      icon: FiStar,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Total Menu Items',
      value: dashboard?.totalMenuItems ?? 24,
      icon: FiBookOpen,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Store Status',
      value: (restaurant?.isAvailable ?? true) ? 'ONLINE' : 'OFFLINE',
      icon: FiActivity,
      color: (restaurant?.isAvailable ?? true) ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-card transition-smooth flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stat.color}`}>
              <Icon />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
