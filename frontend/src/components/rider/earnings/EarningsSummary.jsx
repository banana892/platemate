/**
 * EarningsSummary.jsx — Rider Earnings Metric Overview Cards (Phase F3)
 */

import { FiDollarSign, FiTrendingUp, FiGift, FiZap } from 'react-icons/fi'

export default function EarningsSummary({ earnings = {} }) {
  const {
    today = 380,
    weekly = 4250,
    monthly = 18400,
    tips = 450,
    bonuses = 850,
  } = earnings

  const metrics = [
    { label: "Today's Payout", value: `₹${today}`, subtext: 'Base + tips', icon: FiDollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Weekly Earnings', value: `₹${weekly}`, subtext: 'Last 7 days', icon: FiTrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Monthly Earnings', value: `₹${monthly}`, subtext: 'Last 30 days', icon: FiZap, color: 'text-orange-600 bg-orange-50' },
    { label: 'Bonuses & Tips', value: `₹${tips + bonuses}`, subtext: 'Incentives earned', icon: FiGift, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon
        return (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-black text-gray-400 uppercase tracking-wider">{m.label}</span>
              <div className={`p-2.5 rounded-xl ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{m.value}</p>
            <span className="text-[0.7rem] font-medium text-gray-400 block">{m.subtext}</span>
          </div>
        )
      })}
    </div>
  )
}
