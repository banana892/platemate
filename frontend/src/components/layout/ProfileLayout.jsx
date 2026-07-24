/**
 * ProfileLayout.jsx — Shared Layout Container for Customer Profile Pages
 */

import { useAddresses } from '../../hooks/useAddresses.js'
import { useOrders } from '../../hooks/useOrders.js'
import SettingsNavigation from '../customer/SettingsNavigation.jsx'

export default function ProfileLayout({ children }) {
  const { addresses } = useAddresses()
  const { orders } = useOrders()

  return (
    <div className="min-h-screen bg-[#f8f9ff] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <SettingsNavigation
              addressCount={addresses?.length || 0}
              orderCount={orders?.length || 0}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 min-h-[500px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
