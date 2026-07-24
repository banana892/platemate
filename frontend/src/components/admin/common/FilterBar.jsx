/**
 * FilterBar.jsx — Admin Filter Bar Component (Phase F4)
 */

import { FiFilter } from 'react-icons/fi'

export default function FilterBar({ options = [], selected, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2">
        <FiFilter /> Filters:
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selected === opt.value
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
