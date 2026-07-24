/**
 * SearchBar.jsx — Reusable Search Bar Component
 */

import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full max-w-sm">
      <FiSearch className="absolute left-3.5 top-3.5 text-gray-400 text-base pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-smooth"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-smooth cursor-pointer"
        >
          <FiX className="text-sm" />
        </button>
      )}
    </div>
  )
}
