/**
 * RiderLayout.jsx — Top-Level Rider Dashboard Shell (Phase F3)
 *
 * Integrates:
 * - RiderHeader & RiderNavigation
 * - Persistent Offline Banner
 * - Socket.io real-time connection lifecycle & event listeners
 * - Toast notifications for new assignments & status updates
 */

import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import RiderHeader from './RiderHeader.jsx'
import RiderNavigation from './RiderNavigation.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import useRider from '../../../hooks/useRider.js'
import socketService from '../../../services/socket.service.js'
import {
  addNotificationFromSocket,
  updateActiveDeliveryFromSocket,
  fetchActiveDeliveries,
  fetchRiderDashboard,
} from '../../../store/slices/riderSlice.js'

export default function RiderLayout() {
  const dispatch = useDispatch()
  const {
    profile,
    status,
    notifications,
    unreadNotificationsCount,
    loadProfile,
    loadDashboard,
    changeStatus,
    actionLoading,
  } = useRider()

  // Load initial profile and dashboard metrics
  useEffect(() => {
    loadProfile().catch(() => {})
    loadDashboard().catch(() => {})
  }, [loadProfile, loadDashboard])

  // Socket connection lifecycle & real-time events
  useEffect(() => {
    socketService.connect()

    // 1. New assignment assigned to rider
    socketService.on('rider:new-assignment', (data) => {
      toast.success(
        () => (
          <div className="flex items-center gap-2">
            <span className="text-xl">🛵</span>
            <div>
              <p className="font-bold text-sm">New Delivery Assigned!</p>
              <p className="text-xs text-gray-500">{data?.restaurantName || 'Order'} - ₹{data?.deliveryFee || '50'}</p>
            </div>
          </div>
        ),
        { duration: 6000 }
      )
      dispatch(
        addNotificationFromSocket({
          id: Math.random().toString(),
          type: 'NEW_ASSIGNMENT',
          title: 'New Delivery Assigned',
          message: `Order #${data?.orderNumber || ''} assigned to you.`,
          createdAt: new Date().toISOString(),
          isRead: false,
        })
      )
      dispatch(fetchActiveDeliveries())
      dispatch(fetchRiderDashboard())
    })

    // 2. Delivery status updated
    socketService.on('rider:delivery-updated', (data) => {
      if (data?.order) {
        dispatch(updateActiveDeliveryFromSocket(data.order))
      }
    })

    // 3. General rider notification
    socketService.on('rider:notification', (data) => {
      toast(data?.message || 'New notification', { icon: '🔔' })
      dispatch(
        addNotificationFromSocket({
          id: Math.random().toString(),
          type: 'GENERAL',
          title: data?.title || 'Notification',
          message: data?.message || '',
          createdAt: new Date().toISOString(),
          isRead: false,
        })
      )
    })

    return () => {
      socketService.off('rider:new-assignment')
      socketService.off('rider:delivery-updated')
      socketService.off('rider:notification')
    }
  }, [dispatch])

  const handleStatusChange = async (newStatus) => {
    try {
      await changeStatus(newStatus)
      toast.success(`Availability updated to ${newStatus}`)
    } catch (err) {
      toast.error(err || 'Failed to update status')
    }
  }

  const handleMarkAllRead = () => {
    // Optimistic / Dispatch
  }

  const isOffline = status === 'OFFLINE'

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans text-gray-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Rider Navigation Header */}
      <RiderHeader
        profile={profile}
        status={status}
        unreadCount={unreadNotificationsCount}
        notifications={notifications}
        onStatusChange={handleStatusChange}
        onMarkAllRead={handleMarkAllRead}
        isLoadingStatus={actionLoading}
      />

      {/* Persistent Offline Alert Banner */}
      <OfflineBanner
        isOffline={isOffline}
        onGoOnline={() => handleStatusChange('ONLINE')}
        isLoading={actionLoading}
      />

      {/* Layout Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        <RiderNavigation />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
