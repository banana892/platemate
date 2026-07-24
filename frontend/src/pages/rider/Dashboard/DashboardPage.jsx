/**
 * DashboardPage.jsx — Main Delivery Rider Overview Page (/rider)
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useRider from '../../../hooks/useRider.js'
import useDeliveries from '../../../hooks/useDeliveries.js'
import StatisticsGrid from '../../../components/rider/dashboard/StatisticsGrid.jsx'
import QuickActions from '../../../components/rider/dashboard/QuickActions.jsx'
import ShiftTracker from '../../../components/rider/common/ShiftTracker.jsx'
import DeliveryCard from '../../../components/rider/deliveries/DeliveryCard.jsx'
import DeliveryDetailsDrawer from '../../../components/rider/deliveries/DeliveryDetailsDrawer.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { dashboard, status, shift, loading, changeStatus, loadDashboard } = useRider()
  const { activeDeliveries, loadActiveDeliveries, changeDeliveryStatus, actionLoading } = useDeliveries()
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  useEffect(() => {
    loadDashboard().catch(() => {})
    loadActiveDeliveries().catch(() => {})
  }, [loadDashboard, loadActiveDeliveries])

  const handleToggleShift = async () => {
    const nextStatus = status === 'ONLINE' ? 'OFFLINE' : 'ONLINE'
    try {
      await changeStatus(nextStatus)
      toast.success(nextStatus === 'ONLINE' ? 'Shift started! You are Online.' : 'Shift ended. You are Offline.')
    } catch (err) {
      toast.error(err || 'Failed to toggle shift')
    }
  }

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

  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-28" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  const stats = {
    todayDeliveries: dashboard?.todayStats?.deliveriesCompleted || 0,
    todayEarnings: dashboard?.todayStats?.earnings || 0,
    weeklyEarnings: dashboard?.weeklyStats?.earnings || 0,
    pendingDeliveries: dashboard?.activeDeliveries?.assigned || 0,
    averageRating: dashboard?.averageRating || 4.8,
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rider Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium">Welcome back! Manage your deliveries, shifts, and earnings.</p>
        </div>
      </div>

      {/* Rider Shift Tracker Bar */}
      <ShiftTracker shift={shift} onToggleShift={handleToggleShift} />

      {/* Metric Cards Grid */}
      <StatisticsGrid stats={stats} />

      {/* Quick Action Shortcuts */}
      <QuickActions />

      {/* Active Orders Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-gray-900">
            Assigned Deliveries ({activeDeliveries.length})
          </h3>
          <Link to="/rider/deliveries" className="text-xs font-bold text-orange-600 hover:underline">
            View All Queue →
          </Link>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center space-y-2">
            <div className="text-4xl">🛵</div>
            <h4 className="font-extrabold text-sm text-gray-800">No Active Deliveries Right Now</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Stay Online to automatically receive new order assignments near your area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeliveries.slice(0, 4).map((del) => (
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
      </div>

      {/* Delivery Details Slide-over Drawer */}
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
