/**
 * UnifiedActivityTimeline.jsx — Unified Operations & Audit Trail Widget (Phase F4)
 */

import { FiClock } from 'react-icons/fi'

export default function UnifiedActivityTimeline({ auditLogs = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <FiClock className="text-amber-400 text-lg" /> Unified Operations Timeline
        </div>
        <span className="text-xs text-slate-400 font-mono">Live Logs</span>
      </div>

      <div className="relative border-l border-slate-800 ml-4 space-y-4 py-1">
        {auditLogs.length > 0 ? (
          auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute -left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-900" />
              <div className="text-xs font-bold text-slate-200">{log.action.replace(/_/g, ' ')}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{log.resource}</div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                <span>By {log.admin}</span>
                <span>• {new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="pl-6 text-xs text-slate-500">No activity logs recorded yet</div>
        )}
      </div>
    </div>
  )
}
