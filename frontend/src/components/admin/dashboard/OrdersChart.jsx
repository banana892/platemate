/**
 * OrdersChart.jsx — Admin Order Volume Distribution Widget (Phase F4)
 */

import { FiShoppingBag } from 'react-icons/fi'

export default function OrdersChart() {
  const categories = [
    { label: 'Completed', percentage: 84, color: 'bg-emerald-500', text: 'text-emerald-400' },
    { label: 'Active / Preparation', percentage: 6, color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'Cancelled', percentage: 6, color: 'bg-red-500', text: 'text-red-400' },
    { label: 'Refunded', percentage: 4, color: 'bg-purple-500', text: 'text-purple-400' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-1">
          <FiShoppingBag className="text-amber-400 text-lg" /> Order Fulfillment Status
        </div>
        <div className="text-xs text-slate-400 mb-6">Distribution breakdown of all platform orders</div>
      </div>

      <div className="space-y-4">
        {categories.map((c, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">{c.label}</span>
              <span className={`font-mono font-bold ${c.text}`}>{c.percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${c.percentage}%` }}
                className={`h-full ${c.color} rounded-full transition-all duration-500`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
