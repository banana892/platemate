/**
 * RiderNavigation.jsx — Rider Navigation Sidebar & Mobile Bottom Bar (Phase F3)
 */

import { NavLink } from 'react-router-dom'
import {
  FiGrid,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiTruck,
  FiUser,
  FiSettings,
} from 'react-icons/fi'

const NAV_ITEMS = [
  { path: '/rider', label: 'Dashboard', icon: FiGrid },
  { path: '/rider/deliveries', label: 'Active', icon: FiPackage },
  { path: '/rider/history', label: 'History', icon: FiClock },
  { path: '/rider/earnings', label: 'Earnings', icon: FiDollarSign },
  { path: '/rider/performance', label: 'Performance', icon: FiTrendingUp },
  { path: '/rider/vehicle', label: 'Vehicle', icon: FiTruck },
  { path: '/rider/profile', label: 'Profile', icon: FiUser },
  { path: '/rider/settings', label: 'Settings', icon: FiSettings },
]

export default function RiderNavigation() {
  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] p-4 shrink-0">
        <nav className="space-y-1">
          <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-wider px-3 mb-2">
            Rider Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/rider'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-2 py-1.5 shadow-2xl flex items-center justify-around">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/rider'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[0.65rem] font-bold transition-colors ${
                  isActive ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
