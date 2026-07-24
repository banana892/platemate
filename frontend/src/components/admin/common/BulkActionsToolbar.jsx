/**
 * BulkActionsToolbar.jsx — Batch Operations Action Bar (Phase F4)
 */

import { FiCheckCircle, FiSlash, FiDownload } from 'react-icons/fi'

export default function BulkActionsToolbar({
  selectedCount = 0,
  onApprove,
  onSuspend,
  onExport,
  onClear,
}) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-amber-950/90 border border-amber-500/50 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs text-amber-200 shadow-xl animate-fade-in">
      <div className="flex items-center gap-2 font-bold">
        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
          {selectedCount}
        </span>
        <span>Item(s) Selected for Bulk Actions</span>
      </div>

      <div className="flex items-center gap-2">
        {onApprove && (
          <button
            onClick={onApprove}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <FiCheckCircle /> Bulk Approve / Activate
          </button>
        )}
        {onSuspend && (
          <button
            onClick={onSuspend}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <FiSlash /> Bulk Suspend
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold flex items-center gap-1.5 transition-colors"
          >
            <FiDownload /> Export Selected CSV
          </button>
        )}
        <button
          onClick={onClear}
          className="px-2.5 py-1.5 text-slate-400 hover:text-white font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
