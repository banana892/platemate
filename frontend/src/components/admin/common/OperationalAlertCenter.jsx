/**
 * OperationalAlertCenter.jsx — Critical System Operational Alerts Ticker (Phase F4)
 */

import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi'

export default function OperationalAlertCenter({ alerts = [] }) {
  if (!alerts || alerts.length === 0) return null

  return (
    <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 mb-6 text-amber-200 shadow-lg shadow-amber-950/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-bold text-amber-400 text-sm tracking-wide uppercase">
          <FiAlertTriangle className="text-lg animate-pulse" /> Live Operational Alert Ticker
        </div>
        <span className="text-xs text-amber-400/70 font-mono">{alerts.length} Active Notice(s)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
              alt.severity === 'HIGH'
                ? 'bg-red-950/60 border-red-500/40 text-red-200'
                : alt.severity === 'MEDIUM'
                ? 'bg-amber-900/40 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-700 text-slate-300'
            }`}
          >
            {alt.severity === 'HIGH' ? (
              <FiAlertTriangle className="text-red-400 text-lg shrink-0 mt-0.5" />
            ) : alt.severity === 'MEDIUM' ? (
              <FiInfo className="text-amber-400 text-lg shrink-0 mt-0.5" />
            ) : (
              <FiCheckCircle className="text-emerald-400 text-lg shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold mb-0.5">{alt.title}</div>
              <div className="opacity-80 leading-relaxed">{alt.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
