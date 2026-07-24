/**
 * PerformanceTrends.jsx — Rider Rating Trends & Busy Zone Heatmap (Phase F3)
 */

import { FiStar, FiMap } from 'react-icons/fi'

export default function PerformanceTrends() {
  const ratingDistribution = [
    { stars: 5, count: 42, percent: 84 },
    { stars: 4, count: 6, percent: 12 },
    { stars: 3, count: 2, percent: 4 },
    { stars: 2, count: 0, percent: 0 },
    { stars: 1, count: 0, percent: 0 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer Rating Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Rating Breakdown</h3>
            <p className="text-xs text-gray-400">Customer feedback summary</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-black text-xs border border-amber-200">
            <FiStar className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>4.8 / 5.0</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {ratingDistribution.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-xs font-bold">
              <span className="w-12 text-gray-600 flex items-center gap-1">
                {row.stars} <FiStar className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-12 text-right text-gray-500">{row.count} ({row.percent}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Busy Zones & Heatmap Placeholder */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-4 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between z-10">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FiMap className="w-4 h-4 text-orange-400" />
              <span>High Demand Heatmap</span>
            </h3>
            <p className="text-xs text-slate-400">Recommended hotspots with surge bonuses</p>
          </div>
          <span className="bg-orange-500/20 text-orange-400 text-xs font-black px-2.5 py-1 rounded-full border border-orange-500/30">
            Live Surge 1.5x
          </span>
        </div>

        {/* Heatmap Graphic Representation */}
        <div className="h-40 bg-slate-950 rounded-2xl relative flex items-center justify-center border border-slate-800 overflow-hidden">
          <div className="absolute w-32 h-32 bg-orange-500/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute w-20 h-20 bg-amber-500/40 rounded-full blur-xl animate-ping" />
          <div className="relative z-10 text-center space-y-1">
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest block">Koramangala Hotspot</span>
            <p className="text-[0.7rem] text-slate-400">12+ orders available per hour</p>
          </div>
        </div>
      </div>
    </div>
  )
}
