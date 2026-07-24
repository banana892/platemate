/**
 * AdminNavigation.jsx — Admin Operations Sidebar Navigation (Phase F4)
 */

import { Link, useLocation } from 'react-router-dom'
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiShoppingBag,
  FiTruck,
  FiDollarSign,
  FiBarChart2,
  FiAlertTriangle,
  FiBell,
  FiSettings,
  FiActivity,
  FiFileText,
  FiLayers,
} from 'react-icons/fi'

const NAV_ITEMS = [
  { label: 'Overview', path: '/admin', icon: FiGrid },
  { label: 'All Users', path: '/admin/users', icon: FiUsers },
  { label: 'Customers', path: '/admin/customers', icon: FiUserCheck },
  { label: 'Partners', path: '/admin/partners', icon: FiShoppingBag },
  { label: 'Delivery Riders', path: '/admin/riders', icon: FiTruck },
  { label: 'Restaurants', path: '/admin/restaurants', icon: FiLayers, badge: '5' },
  { label: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
  { label: 'Payments & Revenue', path: '/admin/payments', icon: FiDollarSign },
  { label: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
  { label: 'Disputes', path: '/admin/disputes', icon: FiAlertTriangle, badge: '2' },
  { label: 'Notifications', path: '/admin/notifications', icon: FiBell },
  { label: 'Platform Settings', path: '/admin/settings', icon: FiSettings },
  { label: 'System Health', path: '/admin/system', icon: FiActivity },
  { label: 'Audit Logs', path: '/admin/audit', icon: FiFileText },
]

export default function AdminNavigation({ collapsed }) {
  const location = useLocation()

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-20 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-full overflow-y-auto py-4 px-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations & Control
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Icon className={`text-lg shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
