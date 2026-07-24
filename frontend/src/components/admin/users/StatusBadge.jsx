/**
 * StatusBadge.jsx — Visual Badge for Entity Account Statuses (Phase F4)
 */

export default function StatusBadge({ status }) {
  const statusStyles = {
    ACTIVE: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    APPROVED: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    VERIFIED: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    PENDING: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    PENDING_VERIFICATION: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    SUSPENDED: 'bg-red-950/80 text-red-400 border-red-500/30',
    REJECTED: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
    DEACTIVATED: 'bg-slate-950 text-slate-400 border-slate-700',
  }

  const cls = statusStyles[status] || 'bg-slate-800 text-slate-300 border-slate-700'

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
