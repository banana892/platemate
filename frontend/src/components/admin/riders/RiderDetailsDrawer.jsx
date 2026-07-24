/**
 * RiderDetailsDrawer.jsx — Delivery Rider Verification Inspection Drawer (Phase F4)
 */

import { FiX, FiCheck, FiTruck, FiMail, FiPhone, FiStar, FiFileText } from 'react-icons/fi'
import StatusBadge from '../users/StatusBadge.jsx'

export default function RiderDetailsDrawer({ rider, isOpen, onClose, onApprove }) {
  if (!isOpen || !rider) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100">{rider.name}</h3>
              <p className="text-xs text-amber-400 font-medium">{rider.vehicleType}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Verification State</div>
                <StatusBadge status={rider.verificationStatus} />
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Rating</div>
                <div className="text-base font-black text-amber-400 flex items-center gap-1 justify-end">
                  <FiStar /> {rider.averageRating}
                </div>
              </div>
            </div>

            {/* Rider Info */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rider Contact</div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiMail className="text-amber-400 shrink-0" />
                <span>{rider.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiPhone className="text-amber-400 shrink-0" />
                <span>{rider.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiTruck className="text-amber-400 shrink-0" />
                <span>Vehicle: {rider.vehicleType} ({rider.vehicleNumber})</span>
              </div>
            </div>

            {/* Background Check & Documents */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Background & License Checks</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiFileText className="text-amber-400" /> Driving License & ID Proof
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">PASSED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiFileText className="text-amber-400" /> Vehicle Registration (RC)
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">PASSED</span>
              </div>
            </div>

            {/* Actions */}
            {rider.verificationStatus !== 'VERIFIED' && (
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    onApprove(rider.id)
                    onClose()
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <FiCheck /> Verify Rider Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
