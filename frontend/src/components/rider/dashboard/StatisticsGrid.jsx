/**
 * StatisticsGrid.jsx — Primary Dashboard Metrics Grid (Phase F3)
 */

import { FiCheckCircle, FiClock, FiDollarSign, FiStar } from 'react-icons/fi'

export default function StatisticsGrid({ stats = {} }) {
  const {
    todayDeliveries = 0,
    todayEarnings = 0,
    weeklyEarnings = 0,
    pendingDeliveries = 0,
    averageRating = 4.8,
  } = stats

  const cards = [
    {
      label: "Today's Deliveries",
      value: todayDeliveries,
      subtext: `${pendingDeliveries} pending`,
      icon: FiCheckCircle,
      gradient: 'from-orange-500 to-amber-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: "Today's Earnings",
      value: `₹${todayEarnings}`,
      subtext: 'Includes base & tips',
      icon: FiDollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Weekly Earnings',
      value: `₹${weeklyEarnings}`,
      subtext: 'Last 7 days total',
      icon: FiClock,
      gradient: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Customer Rating',
      value: averageRating,
      subtext: 'Based on last 50 trips',
      icon: FiStar,
      gradient: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-black text-gray-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {card.value}
              </p>
              <span className="text-[0.7rem] font-semibold text-gray-400 mt-0.5 block">
                {card.subtext}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
