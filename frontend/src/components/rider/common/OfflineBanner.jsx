/**
 * OfflineBanner.jsx — Persistent Offline Alert Banner (Phase F3)
 *
 * Appears fixed when rider status is OFFLINE to remind them to go online.
 */

import { FiAlertTriangle, FiZap } from 'react-icons/fi'

export default function OfflineBanner({ isOffline = false, onGoOnline, isLoading = false }) {
  if (!isOffline) return null

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all">
      <div className="flex items-center gap-2.5">
        <FiAlertTriangle className="w-5 h-5 animate-bounce shrink-0" />
        <span>You are currently <strong>Offline</strong>. Switch to Online to start receiving delivery orders.</span>
      </div>
      <button
        type="button"
        disabled={isLoading}
        onClick={onGoOnline}
        className="inline-flex items-center gap-1.5 bg-white text-amber-600 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm hover:bg-amber-50 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
      >
        <FiZap className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span>Go Online</span>
      </button>
    </div>
  )
}
