/**
 * AvailabilityPage.jsx — Availability Status & Work Schedule Page (/rider/availability)
 */

import { useEffect } from 'react'
import useRider from '../../hooks/useRider.js'
import AvailabilityToggle from '../../components/rider/common/AvailabilityToggle.jsx'
import ShiftTracker from '../../components/rider/common/ShiftTracker.jsx'
import toast from 'react-hot-toast'
import { FiInfo } from 'react-icons/fi'

export default function AvailabilityPage() {
  const { status, shift, actionLoading, loadStatus, changeStatus } = useRider()

  useEffect(() => {
    loadStatus().catch(() => {})
  }, [loadStatus])

  const handleStatusChange = async (newStatus) => {
    try {
      await changeStatus(newStatus)
      toast.success(`Availability status changed to ${newStatus}`)
    } catch (err) {
      toast.error(err || 'Failed to update availability status')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Availability & Shift Schedule</h1>
        <p className="text-xs text-gray-500 font-medium">Control your work status, start/end shift sessions, and manage break mode.</p>
      </div>

      <ShiftTracker
        shift={shift}
        onToggleShift={() => handleStatusChange(status === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
      />

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">Status Selector</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600">Current Online Mode</span>
          <AvailabilityToggle
            currentStatus={status}
            onStatusChange={handleStatusChange}
            isLoading={actionLoading}
          />
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1 flex items-start gap-2.5">
        <FiInfo className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-800">Shift Guidelines</span>
          <p className="text-amber-700 leading-snug">
            Going Offline will prevent new order assignments from reaching your app. Switch to "On Break" if taking a short pause during an active shift.
          </p>
        </div>
      </div>
    </div>
  )
}
