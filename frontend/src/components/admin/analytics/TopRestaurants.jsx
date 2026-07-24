/**
 * TopRestaurants.jsx — Ranked Leaderboard Widget for Top Performing Restaurants (Phase F4)
 */

import { FiAward } from 'react-icons/fi'

export default function TopRestaurants({ list = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-1">
        <FiAward className="text-amber-400 text-lg" /> Top Performing Restaurants
      </div>
      <div className="text-xs text-slate-400 mb-4">Ranked by gross sales volume</div>

      <div className="space-y-3">
        {list.map((r, i) => (
          <div key={r.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
                #{i + 1}
              </div>
              <div>
                <div className="font-bold text-slate-200">{r.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">{r.totalOrders || r.ordersCount} completed orders</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-emerald-400 font-mono">${(r.revenue || 0).toLocaleString()}</div>
              <div className="text-[10px] text-amber-400 font-bold">★ {r.rating || 4.8}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
