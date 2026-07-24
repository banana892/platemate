/**
 * RoleBadge.jsx — Visual Badge for Primary Roles & Sub-Roles (Phase F4)
 */

export default function RoleBadge({ role, subRole }) {
  const roleStyles = {
    CUSTOMER: 'bg-blue-950/80 text-blue-400 border-blue-500/30',
    PARTNER: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    RIDER: 'bg-purple-950/80 text-purple-400 border-purple-500/30',
    ADMIN: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
  }

  const cls = roleStyles[role] || 'bg-slate-800 text-slate-300 border-slate-700'

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
        {role}
      </span>
      {subRole && subRole !== role && (
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
          {subRole}
        </span>
      )}
    </div>
  )
}
