/**
 * SystemStatusCard.jsx — Maintenance Mode & Emergency Switch Card (Phase F4)
 */

import { FiAlertOctagon, FiCheckCircle } from 'react-icons/fi'

export default function SystemStatusCard({ maintenanceMode, onToggleMode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 font-bold text-base text-slate-100">
          {maintenanceMode ? (
            <FiAlertOctagon className="text-red-400 text-xl" />
          ) : (
            <FiCheckCircle className="text-emerald-400 text-xl" />
          )}
          Platform Maintenance Mode
        </div>
        <div className="text-xs text-slate-400 mt-1">
          When active, new order creation is temporarily paused across customer apps.
        </div>
      </div>

      <button
        onClick={() => onToggleMode(!maintenanceMode)}
        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
          maintenanceMode
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
        }`}
      >
        {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
      </button>
    </div>
  )
}
