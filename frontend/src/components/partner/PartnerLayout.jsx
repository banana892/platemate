/**
 * PartnerLayout.jsx — Container Layout for Restaurant Partner Portal Pages
 */

import { Outlet } from 'react-router-dom'
import { usePartnerOrders } from '../../hooks/usePartnerOrders.js'
import PartnerHeader from './PartnerHeader.jsx'
import PartnerNavigation from './PartnerNavigation.jsx'

export default function PartnerLayout({ children }) {
  const { orders } = usePartnerOrders()
  const pendingCount = orders?.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)).length || 0

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      {/* Partner Dedicated Top Navigation Header */}
      <PartnerHeader pendingOrderCount={pendingCount} />

      {/* Main Partner Container */}
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Partner Sidebar Navigation (Hidden on mobile, drawer handled in Header) */}
          <div className="hidden lg:block lg:col-span-1">
            <PartnerNavigation pendingOrderCount={pendingCount} />
          </div>

          {/* Main Dashboard Content View */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 min-h-[550px]">
              {children || <Outlet />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
