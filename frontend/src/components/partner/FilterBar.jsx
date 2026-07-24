/**
 * FilterBar.jsx — Reusable Filter Pills Component
 */

export default function FilterBar({ options = [], selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const isSelected = selected === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-smooth cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-glow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
