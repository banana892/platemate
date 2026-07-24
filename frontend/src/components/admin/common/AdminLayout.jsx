/**
 * AdminLayout.jsx — Admin Master Shell Layout (Phase F4)
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader.jsx'
import AdminNavigation from './AdminNavigation.jsx'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar */}
      <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Sidebar Navigation */}
      <AdminNavigation collapsed={collapsed} />

      {/* Main Content View */}
      <main
        className={`pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  )
}
