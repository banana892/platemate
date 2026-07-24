/**
 * RefundDialog.jsx — Admin Financial Refund Execution Dialog (Phase F4)
 */

import { useState } from 'react'
import { FiX, FiDollarSign, FiRefreshCw } from 'react-icons/fi'

export default function RefundDialog({ payment, isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState(payment?.amount || 0)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !payment) return null

  const handleRefund = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit(payment.id, { amount: Number(amount), reason })
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-amber-400">
            <FiDollarSign className="text-xl" /> Issue Customer Refund
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleRefund} className="space-y-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-medium">Transaction Reference</div>
            <div className="font-bold text-slate-200">{payment.transactionId}</div>
            <div className="text-slate-400">Original Amount: <span className="text-emerald-400 font-bold">${payment.amount}</span></div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Refund Amount ($)</label>
            <input
              type="number"
              step="0.01"
              max={payment.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Reason for Refund</label>
            <textarea
              rows={3}
              placeholder="Provide reason for auditing..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
          >
            <FiRefreshCw /> {submitting ? 'Processing Refund...' : 'Confirm & Execute Refund'}
          </button>
        </form>
      </div>
    </div>
  )
}
