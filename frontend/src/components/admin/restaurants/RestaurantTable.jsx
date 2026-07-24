/**
 * RestaurantTable.jsx — Master Restaurant Moderation Data Table (Phase F4)
 */

import StatusBadge from '../users/StatusBadge.jsx'
import { FiEye, FiCheck, FiX, FiSlash } from 'react-icons/fi'

export default function RestaurantTable({
  restaurants = [],
  onViewDetails,
  onApprove,
  onReject,
  onSuspend,
}) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
      <table className="w-full text-left border-collapse text-xs text-slate-200">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="p-3.5">Restaurant</th>
            <th className="p-3.5">Cuisine</th>
            <th className="p-3.5">Owner Info</th>
            <th className="p-3.5">Rating & Menu</th>
            <th className="p-3.5">Total Revenue</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {restaurants.length > 0 ? (
            restaurants.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-slate-100">{r.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{r.address}</div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">{r.cuisine}</span>
                </td>
                <td className="p-3.5">
                  <div>{r.ownerName}</div>
                  <div className="text-[11px] text-slate-400">{r.ownerEmail}</div>
                </td>
                <td className="p-3.5">
                  <div className="font-bold text-amber-400">★ {r.rating}</div>
                  <div className="text-[11px] text-slate-400">{r.menuItemsCount} items</div>
                </td>
                <td className="p-3.5 font-bold text-emerald-400 font-mono">
                  ${r.revenue?.toLocaleString()}
                </td>
                <td className="p-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(r)}
                      title="View Details"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                    >
                      <FiEye className="text-base" />
                    </button>
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onApprove(r.id)}
                          title="Approve"
                          className="p-1.5 rounded-lg hover:bg-emerald-950 text-slate-400 hover:text-emerald-400"
                        >
                          <FiCheck className="text-base" />
                        </button>
                        <button
                          onClick={() => onReject(r.id, 'Incomplete application')}
                          title="Reject"
                          className="p-1.5 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400"
                        >
                          <FiX className="text-base" />
                        </button>
                      </>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        onClick={() => onSuspend(r.id, 'Violation of terms')}
                        title="Suspend"
                        className="p-1.5 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400"
                      >
                        <FiSlash className="text-base" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                No restaurants found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
