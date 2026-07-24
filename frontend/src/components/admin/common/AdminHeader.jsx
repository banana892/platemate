/**
 * AdminHeader.jsx — Admin Operations Top Navigation Bar (Phase F4)
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiShield,
  FiChevronDown,
} from 'react-icons/fi'
import useAdminDashboard from '../../../hooks/useAdminDashboard.js'
import GlobalSearchModal from './GlobalSearchModal.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import UserDropdown from '../../common/UserDropdown.jsx'

export default function AdminHeader({ collapsed, setCollapsed }) {
  const { currentSubRole, changeSubRole } = useAdminDashboard()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [roleDropdown, setRoleDropdown] = useState(false)

  const SUB_ROLES = ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'FINANCE']

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-30 flex items-center justify-between px-4 text-slate-200 shadow-md">
        {/* Left section: Brand & Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <FiMenu className="text-xl" />
          </button>
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              P
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              PlateMate Ops
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live
          </span>
        </div>

        {/* Center section: Global Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs font-medium transition-all shadow-inner"
          >
            <FiSearch className="text-sm text-amber-400" />
            <span>Search users, restaurants, orders...</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right section: Sub-Role Switcher, Alerts, Profile */}
        <div className="flex items-center gap-3">
          {/* Sub-Role Context Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdown(!roleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <FiShield />
              <span>{currentSubRole.replace(/_/g, ' ')}</span>
              <FiChevronDown />
            </button>

            {roleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-40 text-xs font-medium">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Role View
                </div>
                {SUB_ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      changeSubRole(r)
                      setRoleDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      currentSubRole === r ? 'text-amber-400 font-bold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    {r.replace(/_/g, ' ')}
                    {currentSubRole === r && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Trigger for Mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <FiSearch className="text-lg" />
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setNotifOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 relative transition-colors"
          >
            <FiBell className="text-lg" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
          </button>

          {/* Admin Avatar & Dropdown */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <UserDropdown variant="dark" profileLink="/admin/settings" settingsLink="/admin/settings" />
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notification Center */}
      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
