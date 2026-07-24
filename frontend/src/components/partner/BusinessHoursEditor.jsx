/**
 * BusinessHoursEditor.jsx — Interactive Weekly Schedule Editor Component
 */

import { useState } from 'react'
import { FiClock, FiCopy, FiSave } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_SCHEDULE = DAYS.reduce((acc, day) => {
  acc[day] = { isClosed: false, is24Hours: false, openTime: '09:00', closeTime: '22:00' }
  return acc
}, {})

export default function BusinessHoursEditor({ initialSchedule = null, onSave, loading = false }) {
  const [schedule, setSchedule] = useState(() => {
    if (!initialSchedule || Object.keys(initialSchedule).length === 0) {
      return DEFAULT_SCHEDULE
    }
    // Convert array format to map if needed
    if (Array.isArray(initialSchedule)) {
      const map = { ...DEFAULT_SCHEDULE }
      initialSchedule.forEach((item) => {
        if (item.dayOfWeek !== undefined || item.day) {
          const dayName = item.day || DAYS[item.dayOfWeek] || DAYS[0]
          map[dayName] = {
            isClosed: Boolean(item.isClosed),
            is24Hours: Boolean(item.is24Hours),
            openTime: item.openTime || '09:00',
            closeTime: item.closeTime || '22:00',
          }
        }
      })
      return map
    }
    return { ...DEFAULT_SCHEDULE, ...initialSchedule }
  })

  const handleChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleCopyMonday = () => {
    const mondayConfig = schedule['Monday']
    if (!mondayConfig) return

    const copied = DAYS.reduce((acc, day) => {
      acc[day] = { ...mondayConfig }
      return acc
    }, {})

    setSchedule(copied)
    toast.success('Applied Monday schedule to all days!')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate opening time precedes closing time for all open, non-24h days
    for (const day of DAYS) {
      const config = schedule[day]
      if (!config.isClosed && !config.is24Hours) {
        if (config.openTime >= config.closeTime) {
          toast.error(`Invalid hours on ${day}: Opening time (${config.openTime}) must be earlier than closing time (${config.closeTime}).`)
          return
        }
      }
    }

    onSave(schedule)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-orange-50/70 border border-orange-100 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-800">
          <FiClock className="text-orange-600 text-base" />
          <span>Weekly Operating Hours</span>
        </div>

        <button
          type="button"
          onClick={handleCopyMonday}
          className="bg-white border border-orange-200 text-orange-700 px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-orange-100/50 transition-smooth flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <FiCopy className="text-xs" />
          <span>Copy Monday Schedule to All</span>
        </button>
      </div>

      {/* Schedule Rows */}
      <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {DAYS.map((day) => {
          const config = schedule[day] || { isClosed: false, is24Hours: false, openTime: '09:00', closeTime: '22:00' }

          return (
            <div
              key={day}
              className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-smooth ${
                config.isClosed ? 'bg-gray-50/70 opacity-75' : ''
              }`}
            >
              {/* Day Name & Status Checkboxes */}
              <div className="flex items-center gap-4 min-w-[180px]">
                <span className="font-bold text-sm text-gray-900 w-24">{day}</span>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isClosed}
                    onChange={(e) => handleChange(day, 'isClosed', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Closed</span>
                </label>
              </div>

              {/* Operating Hours Selectors */}
              {!config.isClosed && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mr-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.is24Hours}
                      onChange={(e) => handleChange(day, 'is24Hours', e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>24 Hours</span>
                  </label>

                  {!config.is24Hours && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={config.openTime}
                        onChange={(e) => handleChange(day, 'openTime', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-orange-500"
                      />
                      <span className="text-gray-400 text-xs font-semibold">to</span>
                      <input
                        type="time"
                        value={config.closeTime}
                        onChange={(e) => handleChange(day, 'closeTime', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {config.isClosed && (
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Store Closed
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiSave className="text-base" />
              <span>Save Business Hours</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
