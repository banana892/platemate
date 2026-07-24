/**
 * PartnerHeader.jsx — Top Navigation Header for Restaurant Partner Portal
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiHome, FiMenu, FiX, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth.js'
import UserDropdown from '../common/UserDropdown.jsx'

export default function PartnerHeader({ pendingOrderCount = 0 }) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const partnerProfileLink = '/partner/profile'
  const partnerSettingsLink = '/partner/settings'

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>

          <Link to="/partner/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              <FiHome className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-gray-900 tracking-tight block leading-none">
                Plate<span className="text-orange-600">Mate</span>
              </span>
              <span className="text-[0.65rem] font-black text-orange-600 uppercase tracking-widest block mt-0.5">
                Partner Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Restaurant Badge */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[200px]">{user?.restaurantName || user?.name || 'Restaurant Admin'}</span>
        </div>

        {/* Right: Live Orders Badge & User Profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/partner/orders"
            className="relative p-2 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Live Orders"
          >
            <FiShoppingBag className="text-lg" />
            <span className="hidden sm:inline">Orders</span>
            {pendingOrderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                {pendingOrderCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <UserDropdown
            profileLink={partnerProfileLink}
            settingsLink={partnerSettingsLink}
          />
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-1 shadow-lg animate-fade-in">
          <NavLink
            to="/partner/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/partner/orders"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <span>Live Orders</span>
            {pendingOrderCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {pendingOrderCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/partner/menu"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Menu Items
          </NavLink>
          <NavLink
            to="/partner/categories"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Categories
          </NavLink>
          <NavLink
            to="/partner/business-hours"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Business Hours
          </NavLink>
          <NavLink
            to="/partner/reviews"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Reviews
          </NavLink>
          <NavLink
            to="/partner/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Analytics
          </NavLink>
          <NavLink
            to="/partner/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Restaurant Profile
          </NavLink>
          <NavLink
            to="/partner/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl font-bold text-xs ${
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Settings
          </NavLink>
        </div>
      )}
    </header>
  )
}
