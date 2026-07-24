/**
 * SettingsPage.jsx — Rider App Settings & Preferences (/rider/settings)
 */

import { useState } from 'react'
import { FiBell, FiMoon, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [newOrderAlerts, setNewOrderAlerts] = useState(true)
  const [earningsUpdates, setEarningsUpdates] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rider Settings</h1>
        <p className="text-xs text-gray-500 font-medium">Customize notification sound alerts, dispatch preferences, and security options.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiBell className="w-4 h-4 text-orange-500" />
            <span>Alerts & Notifications</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-gray-800 block">New Assignment Sounds</span>
                <span className="text-[0.7rem] text-gray-400">Play high-volume alert when new order is assigned</span>
              </div>
              <input
                type="checkbox"
                checked={newOrderAlerts}
                onChange={(e) => setNewOrderAlerts(e.target.checked)}
                className="w-4 h-4 accent-orange-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-gray-800 block">Daily Earnings Summary</span>
                <span className="text-[0.7rem] text-gray-400">Receive end-of-shift payout summary SMS</span>
              </div>
              <input
                type="checkbox"
                checked={earningsUpdates}
                onChange={(e) => setEarningsUpdates(e.target.checked)}
                className="w-4 h-4 accent-orange-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="space-y-4 pt-2">
          <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiMoon className="w-4 h-4 text-indigo-500" />
            <span>Map & Display</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-gray-800 block">Night Navigation Mode</span>
              <span className="text-[0.7rem] text-gray-400">Automatically switch map to dark theme at sunset</span>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="w-4 h-4 accent-orange-600 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FiCheck className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  )
}
