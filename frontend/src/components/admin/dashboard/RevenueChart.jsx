/**
 * RevenueChart.jsx — Admin Interactive Revenue Visualization Widget (Phase F4)
 */

import { useState } from 'react'
import { FiTrendingUp } from 'react-icons/fi'

export default function RevenueChart({ data }) {
  const [timeframe, setTimeframe] = useState('WEEK')

  const chartData = data || [
    { label: 'Mon', revenue: 12400 },
    { label: 'Tue', revenue: 14200 },
    { label: 'Wed', revenue: 13800 },
    { label: 'Thu', revenue: 16500 },
    { label: 'Fri', revenue: 21400 },
    { label: 'Sat', revenue: 26800 },
    { label: 'Sun', revenue: 24100 },
  ]

  const maxVal = Math.max(...chartData.map((d) => d.revenue), 30000)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FiTrendingUp className="text-amber-400 text-lg" /> Revenue Performance Trends
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Gross revenue trajectory over time</div>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          {['WEEK', 'MONTH', 'YEAR'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeframe === t ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Area Bar Chart */}
      <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
        {chartData.map((item, idx) => {
          const heightPercent = Math.round((item.revenue / maxVal) * 100)
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                ${(item.revenue / 1000).toFixed(1)}k
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-xl group-hover:from-amber-400 group-hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-amber-500/20 relative"
              />
              <span className="text-[11px] font-semibold text-slate-400 mt-2">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
