/**
 * useNotifications.js — Custom Hook for Admin System Alerts & Broadcasts (Phase F4)
 */

import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import adminService from '../services/admin.service.js'

export function useNotifications() {

  const { notifications } = useSelector((state) => state.admin)

  const broadcastNotification = async (payload) => {
    try {
      await adminService.broadcastNotification(payload)
      toast.success('Broadcast notification queued successfully!')
      return true
    } catch (_err) {
      toast.error(_err?.message || 'Failed to broadcast notification')
      return false
    }
  }

  return {
    notifications,
    broadcastNotification,
  }
}

export default useNotifications
