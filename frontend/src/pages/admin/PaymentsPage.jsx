/**
 * PaymentsPage.jsx — Admin Payments & Financial Transactions Page (Phase F4)
 */

import { useEffect, useState } from 'react'
import usePayments from '../../hooks/usePayments.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import PaymentsTable from '../../components/admin/payments/PaymentsTable.jsx'
import RefundDialog from '../../components/admin/payments/RefundDialog.jsx'
import { FiDownload } from 'react-icons/fi'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function PaymentsPage() {
  const { payments, loading, fetchPayments, processRefund, exportPaymentsCSV } = usePayments()
  const [search, setSearch] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [refundOpen, setRefundOpen] = useState(false)

  useEffect(() => {
    fetchPayments({ search })
  }, [fetchPayments, search])

  const handleOpenRefund = (p) => {
    setSelectedPayment(p)
    setRefundOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">Payments & Platform Revenue</h1>
          <p className="text-xs text-slate-400">Track gross merchandise volume, commission payouts, and refunds</p>
        </div>
        <button
          onClick={exportPaymentsCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
        >
          <FiDownload /> Export Payments CSV
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Gross Transaction Volume</div>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">${(payments?.summary?.totalVolume || 194200).toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Platform Net Commission</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">${(payments?.summary?.platformCommission || 29130).toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Total Refund Volume</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">${(payments?.summary?.refundedVolume || 3250).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by transaction ID, order number..." />
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-64" />
      ) : (
        <PaymentsTable payments={payments?.items || []} onOpenRefund={handleOpenRefund} />
      )}

      <RefundDialog
        payment={selectedPayment}
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        onSubmit={processRefund}
      />
    </div>
  )
}
