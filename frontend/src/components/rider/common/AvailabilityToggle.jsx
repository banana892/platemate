/**
 * AvailabilityToggle.jsx — Interactive Rider Status Selector (Phase F3)
 *
 * Toggles status between ONLINE, OFFLINE, BUSY, ON_BREAK.
 */

import { useState } from 'react'
import { FiCheck, FiChevronDown, FiMoon, FiCoffee, FiActivity, FiSlash } from 'react-icons/fi'

const STATUS_OPTIONS = [
  {
    id: 'ONLINE',
    label: 'Online',
    description: 'Ready to receive new delivery orders',
    badgeClass: 'bg-emerald-500 text-white shadow-emerald-200',
    dotClass: 'bg-emerald-400',
    icon: FiActivity,
  },
  {
    id: 'BUSY',
    label: 'Busy',
    description: 'Currently delivering an assigned order',
    badgeClass: 'bg-amber-500 text-white shadow-amber-200',
    dotClass: 'bg-amber-400',
    icon: FiMoon,
  },
  {
    id: 'ON_BREAK',
    label: 'On Break',
    description: 'Taking a short break',
    badgeClass: 'bg-indigo-500 text-white shadow-indigo-200',
    dotClass: 'bg-indigo-400',
    icon: FiCoffee,
  },
  {
    id: 'OFFLINE',
    label: 'Offline',
    description: 'Unavailable for delivery assignments',
    badgeClass: 'bg-gray-500 text-white shadow-gray-200',
    dotClass: 'bg-gray-400',
    icon: FiSlash,
  },
]

export default function AvailabilityToggle({ currentStatus = 'OFFLINE', onStatusChange, isLoading = false }) {
  const [isOpen, setIsOpen] = useState(false)

  const activeOption = STATUS_OPTIONS.find((s) => s.id === currentStatus) || STATUS_OPTIONS[3]

  const handleSelect = (statusId) => {
    setIsOpen(false)
    if (statusId !== currentStatus && onStatusChange) {
      onStatusChange(statusId)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeOption.badgeClass} disabled:opacity-50 cursor-pointer`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${activeOption.dotClass} animate-pulse`} />
        <span>{activeOption.label}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-30 p-1.5 space-y-1 divide-y divide-gray-100">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = opt.id === currentStatus
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>{opt.label}</span>
                      {isSelected && <FiCheck className="w-4 h-4 text-orange-600" />}
                    </div>
                    <p className="text-[0.7rem] text-gray-400 leading-tight">{opt.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
