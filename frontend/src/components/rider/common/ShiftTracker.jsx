/**
 * ShiftTracker.jsx — Rider Shift Tracker Widget (Phase F3)
 *
 * Displays session start time, live online duration counter, and deliveries completed in shift.
 */

import { FiClock, FiCheckCircle, FiPlay, FiStopCircle } from 'react-icons/fi'

export default function ShiftTracker({ shift = {}, onToggleShift }) {
  const { onlineMinutes = 0, shiftDeliveries = 0, isActive = false } = shift

  const formatHours = (mins) => {
    const hrs = Math.floor(mins / 60)
    const m = mins % 60
    return `${hrs}h ${m}m`
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Metrics Group */}
      <div className="flex items-center gap-6 divide-x divide-gray-700/60 w-full sm:w-auto justify-around sm:justify-start">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
            <FiClock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">Online Duration</span>
            <span className="text-lg font-black text-white">{formatHours(onlineMinutes)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-6">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">Shift Deliveries</span>
            <span className="text-lg font-black text-white">{shiftDeliveries} orders</span>
          </div>
        </div>
      </div>

      {/* Start / End Shift Button */}
      <div className="w-full sm:w-auto">
        <button
          type="button"
          onClick={onToggleShift}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
            isActive
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-900/40'
          }`}
        >
          {isActive ? (
            <>
              <FiStopCircle className="w-4 h-4" />
              <span>End Shift</span>
            </>
          ) : (
            <>
              <FiPlay className="w-4 h-4" />
              <span>Start Shift</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
