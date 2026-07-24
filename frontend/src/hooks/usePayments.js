/**
 * usePayments.js — Custom Hook for Admin Payments & Refund Dialogs (Phase F4)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import paymentService from '../services/payment.service.js'
import adminService from '../services/admin.service.js'
import { fetchAdminPaymentsThunk } from '../store/slices/adminSlice.js'

export function usePayments() {
  const dispatch = useDispatch()
  const { payments, loading } = useSelector((state) => state.admin)

  const fetchPayments = useCallback(async (params = {}) => {
    try {
      return await dispatch(fetchAdminPaymentsThunk(params)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to load payments')
    }
  }, [dispatch])

  const processRefund = async (paymentId, refundData) => {
    try {
      await paymentService.processRefund(paymentId, refundData)
      toast.success('Refund processed successfully')
      fetchPayments()
    } catch (err) {
      toast.error(err.message || 'Refund processing failed')
    }
  }

  const exportPaymentsCSV = async () => {
    try {
      await adminService.exportData('payments', 'csv')
      toast.success('Payment transaction export initiated')
    } catch (_err) {
      toast.error('Failed to export payments')
    }
  }

  return {
    payments,
    loading: loading.payments,
    fetchPayments,
    processRefund,
    exportPaymentsCSV,
  }
}

export default usePayments
