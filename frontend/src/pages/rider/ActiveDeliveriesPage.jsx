/**
 * ActiveDeliveriesPage.jsx — Active Orders Queue Page (/rider/deliveries)
 */

import { useEffect, useState } from 'react'
import useDeliveries from '../../hooks/useDeliveries.js'
import DeliveryCard from '../../components/rider/deliveries/DeliveryCard.jsx'
import DeliveryDetailsDrawer from '../../components/rider/deliveries/DeliveryDetailsDrawer.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function ActiveDeliveriesPage() {
  const { activeDeliveries, loading, actionLoading, loadActiveDeliveries, changeDeliveryStatus } = useDeliveries()
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    loadActiveDeliveries().catch(() => {})
  }, [loadActiveDeliveries])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await changeDeliveryStatus(id, newStatus)
      toast.success(`Delivery status updated to ${newStatus}`)
      if (selectedDelivery?.id === id) {
        setSelectedDelivery((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err) {
      toast.error(err || 'Failed to update delivery status')
    }
  }

  const filteredDeliveries = activeDeliveries.filter((d) => {
    if (statusFilter === 'READY_FOR_PICKUP') return d.status === 'READY_FOR_PICKUP'
    if (statusFilter === 'OUT_FOR_DELIVERY') return d.status === 'OUT_FOR_DELIVERY'
    return true
  })

  if (loading && activeDeliveries.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Deliveries</h1>
          <p className="text-xs text-gray-500 font-medium">Manage order pickups, start deliveries, and complete customer drops.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl self-start sm:self-auto">
          {[
            { id: 'ALL', label: `All (${activeDeliveries.length})` },
            { id: 'READY_FOR_PICKUP', label: 'Pickup' },
            { id: 'OUT_FOR_DELIVERY', label: 'In Transit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Grid */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3">
          <div className="text-5xl">🛵</div>
          <h3 className="font-extrabold text-base text-gray-900">No Active Deliveries Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You currently have no active delivery assignments matching the selected filter. Stay Online to receive orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeliveries.map((del) => (
            <DeliveryCard
              key={del.id}
              delivery={del}
              onSelect={(d) => setSelectedDelivery(d)}
              onStatusChange={handleStatusChange}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Details Slide Drawer */}
      <DeliveryDetailsDrawer
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        delivery={selectedDelivery}
        onStatusChange={handleStatusChange}
        isLoading={actionLoading}
      />
    </div>
  )
}
