/**
 * HeatMapPlaceholder.jsx — Interactive Order Density Geographic Heat Map Simulation (Phase F4)
 */

import { FiMapPin, FiNavigation } from 'react-icons/fi'

export default function HeatMapPlaceholder() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FiMapPin className="text-rose-400 text-lg" /> Live Order Density Heatmap
          </div>
          <div className="text-xs text-slate-400 mt-0.5">High volume delivery demand zones</div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 text-xs font-bold border border-rose-500/30 animate-pulse">
          Live Heatmap Active
        </span>
      </div>

      {/* Simulated Heat Map Grid Canvas */}
      <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Heatmap hotspots */}
        <div className="absolute top-1/3 left-1/4 w-28 h-28 rounded-full bg-rose-500/30 blur-2xl animate-ping" />
        <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full bg-amber-500/30 blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-emerald-500/20 blur-xl" />

        <div className="relative z-10 text-center space-y-2">
          <FiNavigation className="text-3xl text-amber-400 mx-auto animate-bounce" />
          <div className="text-xs font-bold text-slate-200">Central Metro Demand Surge Zone</div>
          <div className="text-[11px] text-slate-400 font-mono">142 Active Orders • 38 Online Riders</div>
        </div>
      </div>
    </div>
  )
}
