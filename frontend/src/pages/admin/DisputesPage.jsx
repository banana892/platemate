/**
 * DisputesPage.jsx — Customer & Partner Dispute Moderation Page (Phase F4)
 */

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FiCheckCircle, FiMessageSquare } from 'react-icons/fi'
import StatusBadge from '../../components/admin/users/StatusBadge.jsx'

export default function DisputesPage() {
  const { disputes } = useSelector((state) => state.admin)
  const [selectedDispute, setSelectedDispute] = useState(null)

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Dispute Review & Moderation Center</h1>
        <p className="text-xs text-slate-400">Resolve order disputes between customers, restaurants, and riders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {disputes.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelectedDispute(d)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedDispute?.id === d.id
                  ? 'bg-slate-900 border-amber-500 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-amber-400 font-mono">{d.ticketNo}</div>
                <StatusBadge status={d.status} />
              </div>
              <div className="font-semibold text-slate-200 text-sm mb-1">{d.issue}</div>
              <div className="text-[11px] text-slate-400">
                Customer: <span className="text-slate-200">{d.customerName}</span> • Restaurant: <span className="text-slate-200">{d.restaurantName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dispute Resolution Ticket Details */}
        <div>
          {selectedDispute ? (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="font-bold text-base text-slate-100 border-b border-slate-800 pb-3">
                Ticket Details: {selectedDispute.ticketNo}
              </div>
              <div className="space-y-2 text-slate-300">
                <div><span className="text-slate-500 font-bold">Issue Description:</span> {selectedDispute.issue}</div>
                <div><span className="text-slate-500 font-bold">Customer:</span> {selectedDispute.customerName}</div>
                <div><span className="text-slate-500 font-bold">Restaurant:</span> {selectedDispute.restaurantName}</div>
                <div><span className="text-slate-500 font-bold">Assigned Rider:</span> {selectedDispute.riderName}</div>
              </div>
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2">
                  <FiCheckCircle /> Mark Resolved
                </button>
                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2">
                  <FiMessageSquare /> Contact Parties
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-xs">
              Select a dispute ticket to view details & resolution actions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
