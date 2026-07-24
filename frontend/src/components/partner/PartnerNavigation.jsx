/**
 * PartnerNavigation.jsx — Navigation Sidebar for Partner Dashboard
 */

import { NavLink } from 'react-router-dom'
import {
  FiGrid,
  FiShoppingBag,
  FiBookOpen,
  FiLayers,
  FiClock,
  FiStar,
  FiBarChart2,
  FiSettings,
  FiHome,
} from 'react-icons/fi'

export default function PartnerNavigation({ pendingOrderCount = 0 }) {
  const navItems = [
    { label: 'Dashboard', href: '/partner', icon: FiGrid, end: true },
    {
      label: 'Live Orders',
      href: '/partner/orders',
      icon: FiShoppingBag,
      badge: pendingOrderCount > 0 ? pendingOrderCount : null,
    },
    { label: 'Menu Items', href: '/partner/menu', icon: FiBookOpen },
    { label: 'Categories', href: '/partner/categories', icon: FiLayers },
    { label: 'Business Hours', href: '/partner/business-hours', icon: FiClock },
    { label: 'Reviews', href: '/partner/reviews', icon: FiStar },
    { label: 'Analytics', href: '/partner/analytics', icon: FiBarChart2 },
    { label: 'Restaurant Profile', href: '/partner/profile', icon: FiHome },
    { label: 'Settings', href: '/partner/settings', icon: FiSettings },
  ]

  return (
    <aside className="bg-white rounded-3xl p-4 shadow-card border border-gray-100 sticky top-20">
      <div className="flex items-center gap-2 px-4 pt-2 pb-4 border-b border-gray-100 mb-2">
        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
          🏪
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 leading-tight">Partner Portal</h3>
          <span className="text-[0.68rem] text-gray-400 font-semibold uppercase tracking-wider">Merchant Admin</span>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-smooth cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-glow'
                    : 'text-gray-600 hover:bg-orange-50/60 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="text-lg flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white text-orange-600 shadow-xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
