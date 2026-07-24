/**
 * PerformanceCard.jsx — Rider Key Performance Metrics Card (Phase F3)
 */

import { FiThumbsUp, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi'

export default function PerformanceCard({ metrics = {} }) {
  const {
    acceptanceRate = 96,
    completionRate = 99,
    onTimeRate = 94,
    customerRating = 4.8,
  } = metrics

  const list = [
    { label: 'Acceptance Rate', value: `${acceptanceRate}%`, subtext: 'Target > 90%', icon: FiThumbsUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Completion Rate', value: `${completionRate}%`, subtext: 'Target > 95%', icon: FiCheckCircle, color: 'text-blue-600 bg-blue-50' },
    { label: 'On-Time Delivery', value: `${onTimeRate}%`, subtext: 'Target > 90%', icon: FiClock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Customer Rating', value: customerRating, subtext: 'Target > 4.5', icon: FiStar, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {list.map((m, idx) => {
        const Icon = m.icon
        return (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-black text-gray-400 uppercase tracking-wider">{m.label}</span>
              <div className={`p-2.5 rounded-xl ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{m.value}</p>
            <span className="text-[0.7rem] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              {m.subtext}
            </span>
          </div>
        )
      })}
    </div>
  )
}
