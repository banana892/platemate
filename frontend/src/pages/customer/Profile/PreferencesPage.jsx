/**
 * PreferencesPage.jsx — Customer Account Preferences & Notification Settings (/profile/preferences)
 */

import { FiBell, FiGlobe, FiMoon } from 'react-icons/fi'
import PreferenceSwitch from '../../../components/customer/PreferenceSwitch.jsx'
import useProfile from '../../../hooks/useProfile.js'

export default function PreferencesPage() {
  const { preferences, updatePreferences } = useProfile()

  const handleToggle = (key, value) => {
    updatePreferences({ [key]: value })
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Preferences</h2>
        <p className="text-sm text-gray-500">Customize your notifications, language, and display options</p>
      </div>

      {/* Notifications Section */}
      <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FiBell className="text-[#FF4F5A]" />
          <span>Notification Settings</span>
        </h3>

        <PreferenceSwitch
          id="emailNotifications"
          label="Email Notifications"
          description="Receive order status updates and delivery receipts via email"
          checked={preferences?.emailNotifications}
          onChange={(val) => handleToggle('emailNotifications', val)}
        />

        <PreferenceSwitch
          id="pushNotifications"
          label="Push Notifications"
          description="Get real-time browser push notifications when your order status changes"
          checked={preferences?.pushNotifications}
          onChange={(val) => handleToggle('pushNotifications', val)}
        />

        <PreferenceSwitch
          id="marketingEmails"
          label="Promotions & Marketing Emails"
          description="Receive exclusive discount offers, promotional banners, and newsletters"
          checked={preferences?.marketingEmails}
          onChange={(val) => handleToggle('marketingEmails', val)}
        />
      </div>

      {/* Localization Section */}
      <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FiGlobe className="text-blue-500" />
          <span>Language & Regional</span>
        </h3>

        <div>
          <label htmlFor="language" className="block text-sm font-bold text-gray-900 mb-1">
            Display Language
          </label>
          <p className="text-xs text-gray-500 mb-2">Select your preferred language for the PlateMate interface</p>
          <select
            id="language"
            value={preferences?.language || 'en'}
            onChange={(e) => handleToggle('language', e.target.value)}
            className="w-full max-w-xs bg-white border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-[#FF4F5A] cursor-pointer"
          >
            <option value="en">English (US)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="es">Spanish (Español)</option>
          </select>
        </div>
      </div>

      {/* Theme Placeholder Section */}
      <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FiMoon className="text-indigo-500" />
          <span>Appearance</span>
        </h3>

        <div>
          <label htmlFor="theme" className="block text-sm font-bold text-gray-900 mb-1">
            Interface Theme
          </label>
          <p className="text-xs text-gray-500 mb-2">Choose between light, dark, or system default themes</p>
          <select
            id="theme"
            value={preferences?.theme || 'light'}
            onChange={(e) => handleToggle('theme', e.target.value)}
            className="w-full max-w-xs bg-white border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-[#FF4F5A] cursor-pointer"
          >
            <option value="light">Light Theme (Default)</option>
            <option value="dark">Dark Theme (Coming Soon)</option>
            <option value="system">System Preference</option>
          </select>
        </div>
      </div>
    </div>
  )
}
