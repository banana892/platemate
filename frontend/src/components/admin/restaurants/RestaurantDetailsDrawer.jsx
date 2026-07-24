/**
 * RestaurantDetailsDrawer.jsx — Full Restaurant Detail Inspection Drawer (Phase F4)
 */

import { FiX, FiCheck, FiSlash, FiFileText, FiStar, FiMapPin, FiMail, FiPhone } from 'react-icons/fi'
import StatusBadge from '../users/StatusBadge.jsx'

export default function RestaurantDetailsDrawer({ restaurant, isOpen, onClose, onApprove, onSuspend }) {
  if (!isOpen || !restaurant) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100">{restaurant.name}</h3>
              <p className="text-xs text-amber-400 font-medium">{restaurant.cuisine} Cuisine</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Status</div>
                <StatusBadge status={restaurant.status} />
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Overall Rating</div>
                <div className="text-base font-black text-amber-400 flex items-center gap-1 justify-end">
                  <FiStar /> {restaurant.rating} ({restaurant.reviewsCount || 0} reviews)
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Information</div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiMail className="text-amber-400 shrink-0" />
                <span>{restaurant.ownerName} ({restaurant.ownerEmail})</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiPhone className="text-amber-400 shrink-0" />
                <span>{restaurant.phone || '+1 555-0192'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FiMapPin className="text-amber-400 shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Menu Count</div>
                <div className="text-lg font-black text-amber-400 mt-1">{restaurant.menuItemsCount || 0} Items</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Total Revenue</div>
                <div className="text-lg font-black text-emerald-400 mt-1">${restaurant.revenue?.toLocaleString()}</div>
              </div>
            </div>

            {/* Documents Verification */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Compliance Documents</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiFileText className="text-amber-400" /> Business License
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">VERIFIED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiFileText className="text-amber-400" /> Food Safety Audit Certificate
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">VERIFIED</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {restaurant.status === 'PENDING' && (
                <button
                  onClick={() => {
                    onApprove(restaurant.id)
                    onClose()
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <FiCheck /> Approve & Onboard Restaurant
                </button>
              )}
              {restaurant.status === 'APPROVED' && (
                <button
                  onClick={() => {
                    onSuspend(restaurant.id, 'Administrative suspension')
                    onClose()
                  }}
                  className="w-full py-3 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <FiSlash /> Suspend Restaurant Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
