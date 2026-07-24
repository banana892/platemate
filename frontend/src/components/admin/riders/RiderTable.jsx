/**
 * RiderTable.jsx — Delivery Rider Verification Data Table (Phase F4)
 */

import StatusBadge from '../users/StatusBadge.jsx'
import { FiEye, FiCheck, FiSlash } from 'react-icons/fi'

export default function RiderTable({ riders = [], onViewDetails, onApprove, onSuspend }) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
      <table className="w-full text-left border-collapse text-xs text-slate-200">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="p-3.5">Rider Name</th>
            <th className="p-3.5">Vehicle Type</th>
            <th className="p-3.5">Deliveries</th>
            <th className="p-3.5">Rating</th>
            <th className="p-3.5">Verification</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {riders.length > 0 ? (
            riders.map((rd) => (
              <tr key={rd.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-slate-100">{rd.name}</div>
                  <div className="text-[11px] text-slate-400">{rd.email}</div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">{rd.vehicleType}</span>
                </td>
                <td className="p-3.5 font-bold text-slate-200">{rd.totalDeliveries} orders</td>
                <td className="p-3.5 font-bold text-amber-400">★ {rd.averageRating}</td>
                <td className="p-3.5">
                  <StatusBadge status={rd.verificationStatus} />
                </td>
                <td className="p-3.5">
                  <StatusBadge status={rd.status} />
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(rd)}
                      title="View Profile Details"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                    >
                      <FiEye className="text-base" />
                    </button>
                    {rd.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => onApprove(rd.id)}
                        title="Verify Rider"
                        className="p-1.5 rounded-lg hover:bg-emerald-950 text-slate-400 hover:text-emerald-400"
                      >
                        <FiCheck className="text-base" />
                      </button>
                    )}
                    {rd.status === 'ACTIVE' && (
                      <button
                        onClick={() => onSuspend(rd.id)}
                        title="Suspend Rider"
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
                No riders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
