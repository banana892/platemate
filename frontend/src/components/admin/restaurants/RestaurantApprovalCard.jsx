/**
 * RestaurantApprovalCard.jsx — Fast Quick Verification & Approval Widget (Phase F4)
 */

import { FiCheck, FiX, FiFileText } from 'react-icons/fi'

export default function RestaurantApprovalCard({ restaurant, onApprove, onReject, onViewDetails }) {
  if (!restaurant) return null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-sm text-slate-100">{restaurant.name}</div>
          <div className="text-xs text-amber-400 font-medium">{restaurant.cuisine} Cuisine</div>
          <div className="text-[11px] text-slate-400 mt-1">Owner: {restaurant.ownerName} ({restaurant.ownerEmail})</div>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">
          PENDING
        </span>
      </div>

      <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div className="font-semibold text-slate-300 mb-1">Submitted Documents:</div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400">
          <FiFileText /> Business License & Health Certificate
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => onApprove(restaurant.id)}
          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1 text-xs shadow-md transition-colors"
        >
          <FiCheck /> Approve
        </button>
        <button
          onClick={() => onReject(restaurant.id, 'Documents incomplete')}
          className="flex-1 py-2 bg-red-950 hover:bg-red-900 text-red-300 font-bold rounded-xl flex items-center justify-center gap-1 text-xs border border-red-500/30 transition-colors"
        >
          <FiX /> Reject
        </button>
        <button
          onClick={() => onViewDetails(restaurant)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
        >
          Details
        </button>
      </div>
    </div>
  )
}
