/**
 * RiderHeader.jsx — Rider Dashboard Header Component (Phase F3)
 */

import { Link } from 'react-router-dom'
import { FiTruck } from 'react-icons/fi'
import AvailabilityToggle from './AvailabilityToggle.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import UserDropdown from '../../common/UserDropdown.jsx'

export default function RiderHeader({
  profile = null,
  status = 'OFFLINE',
  unreadCount = 0,
  notifications = [],
  onStatusChange,
  onMarkAllRead,
  onMarkRead,
  isLoadingStatus = false,
}) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Partner Badge */}
        <div className="flex items-center gap-3">
          <Link to="/rider" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              <FiTruck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-gray-900 tracking-tight block leading-none">
                Plate<span className="text-orange-600">Mate</span>
              </span>
              <span className="text-[0.65rem] font-black text-orange-600 uppercase tracking-widest block mt-0.5">
                Delivery Partner
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Online / Availability Quick Selector */}
        <div className="hidden sm:flex items-center gap-2">
          <AvailabilityToggle
            currentStatus={status}
            onStatusChange={onStatusChange}
            isLoading={isLoadingStatus}
          />
        </div>

        {/* Right: Notifications & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile status toggle compact */}
          <div className="sm:hidden">
            <AvailabilityToggle
              currentStatus={status}
              onStatusChange={onStatusChange}
              isLoading={isLoadingStatus}
            />
          </div>

          {/* Persistent Notifications */}
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={onMarkAllRead}
            onMarkRead={onMarkRead}
          />

          {/* Rider Profile Avatar & Menu */}
          <UserDropdown
            userOverride={profile}
            profileLink="/rider/profile"
            settingsLink="/rider/settings"
          />
        </div>
      </div>
    </header>
  )
}
