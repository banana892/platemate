/**
 * UsersChart.jsx — User Growth Breakdown Widget (Phase F4)
 */

import { FiUsers } from 'react-icons/fi'

export default function UsersChart() {
  const data = [
    { month: 'Jan', customers: 450, partners: 40, riders: 60 },
    { month: 'Feb', customers: 620, partners: 55, riders: 80 },
    { month: 'Mar', customers: 780, partners: 72, riders: 105 },
    { month: 'Apr', customers: 980, partners: 112, riders: 144 },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FiUsers className="text-amber-400 text-lg" /> Platform User Base Growth
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Month-on-month registrations by role</div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {data.map((row, idx) => (
          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>{row.month} 2026</span>
              <span className="text-amber-400 font-mono">{row.customers + row.partners + row.riders} Total</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="bg-blue-950/60 border border-blue-500/30 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">Customers</div>
                <div className="font-bold text-blue-400">{row.customers}</div>
              </div>
              <div className="bg-emerald-950/60 border border-emerald-500/30 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">Partners</div>
                <div className="font-bold text-emerald-400">{row.partners}</div>
              </div>
              <div className="bg-purple-950/60 border border-purple-500/30 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">Riders</div>
                <div className="font-bold text-purple-400">{row.riders}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
