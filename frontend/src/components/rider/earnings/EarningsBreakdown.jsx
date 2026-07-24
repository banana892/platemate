/**
 * EarningsBreakdown.jsx — Itemized Rider Earnings Component (Phase F3)
 */

import { FiDollarSign, FiHeart, FiAward, FiZap } from 'react-icons/fi'

export default function EarningsBreakdown({ breakdown = {} }) {
  const {
    basePay = 3200,
    tips = 450,
    questBonus = 350,
    surgeIncentive = 250,
  } = breakdown

  const total = basePay + tips + questBonus + surgeIncentive

  const items = [
    { label: 'Delivery Base Pay', amount: basePay, icon: FiDollarSign, color: 'text-blue-600 bg-blue-50' },
    { label: 'Customer Tips', amount: tips, icon: FiHeart, color: 'text-rose-600 bg-rose-50' },
    { label: 'Weekly Quest Bonus', amount: questBonus, icon: FiAward, color: 'text-amber-600 bg-amber-50' },
    { label: 'Peak Surge Incentives', amount: surgeIncentive, icon: FiZap, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900">Earnings Breakdown</h3>
          <p className="text-xs text-gray-400">Detailed view of payouts & rewards</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 block uppercase">Total Payout</span>
          <span className="text-xl font-black text-emerald-600">₹{total}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const Icon = item.icon
          const percent = Math.round((item.amount / total) * 100)
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${item.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <span className="font-black text-gray-900">₹{item.amount} ({percent}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
