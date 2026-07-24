import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth.js'
import { executeLogout } from '../../utils/authUtils.js'

export default function UserDropdown({
  userOverride = null,
  profileLink = '/profile',
  settingsLink = '/profile/edit',
  variant = 'light',
  customItems = null,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()

  const currentUser = userOverride || authUser

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogoutClick = async () => {
    setDropdownOpen(false)
    await executeLogout(logout, navigate)
  }

  if (!currentUser) return null

  const isDark = variant === 'dark'

  const buttonClasses = isDark
    ? 'flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors'
    : 'flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-gray-200 bg-gray-50/80 hover:bg-gray-100 text-gray-800 cursor-pointer transition-colors'

  const menuClasses = isDark
    ? 'absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-scale-in text-slate-200'
    : 'absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-scale-in text-gray-800'

  const itemHover = isDark
    ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'

  const avatarUrl = currentUser.avatar || currentUser.logo || currentUser.profileImage

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={buttonClasses}
        aria-label="User menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={currentUser.name || 'User Avatar'}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-500/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {currentUser.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-xs font-bold max-w-[110px] truncate hidden sm:inline">
          {currentUser.name || currentUser.restaurantName || 'Account'}
        </span>
        <FiChevronDown className={`text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className={menuClasses}>
          {/* User Info Header inside dropdown */}
          <div className={`px-4 py-2.5 border-b mb-1 ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
            <p className="text-xs font-bold truncate">{currentUser.name || 'User Account'}</p>
            <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {currentUser.email || currentUser.role || ''}
            </p>
          </div>

          {/* Links */}
          {customItems || (
            <>
              {profileLink && (
                <Link
                  to={profileLink}
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${itemHover}`}
                >
                  <FiUser className="text-sm text-orange-500" />
                  <span>Profile</span>
                </Link>
              )}
              {settingsLink && (
                <Link
                  to={settingsLink}
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${itemHover}`}
                >
                  <FiSettings className="text-sm text-orange-500" />
                  <span>Settings</span>
                </Link>
              )}
            </>
          )}

          <div className={`border-t my-1 ${isDark ? 'border-slate-800' : 'border-gray-100'}`} />

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer`}
          >
            <FiLogOut className="text-sm" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
