/**
 * TopRiders.jsx — Ranked Leaderboard Widget for Top Delivery Riders (Phase F4)
 */

import { FiTruck, FiStar } from 'react-icons/fi'

export default function TopRiders({ list = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-1">
        <FiTruck className="text-purple-400 text-lg" /> Top Delivery Riders
      </div>
      <div className="text-xs text-slate-400 mb-4">Ranked by delivery velocity & rating</div>

      <div className="space-y-3">
        {list.map((rd, i) => (
          <div key={rd.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-black flex items-center justify-center text-xs">
                #{i + 1}
              </div>
              <div>
                <div className="font-bold text-slate-200">{rd.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">{rd.totalDeliveries || rd.deliveriesCount} deliveries</div>
              </div>
            </div>
            <div className="text-right font-bold text-amber-400 flex items-center gap-1">
              <FiStar /> {rd.averageRating || rd.rating || 4.9}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
