/**
 * PaymentsTable.jsx — Master Payments & Platform Revenue Breakdown Table (Phase F4)
 */

import StatusBadge from '../users/StatusBadge.jsx'
import { FiRefreshCcw } from 'react-icons/fi'

export default function PaymentsTable({ payments = [], onOpenRefund }) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
      <table className="w-full text-left border-collapse text-xs text-slate-200">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="p-3.5">Transaction ID</th>
            <th className="p-3.5">Order</th>
            <th className="p-3.5">Gross Amount</th>
            <th className="p-3.5">Platform Commission</th>
            <th className="p-3.5">Delivery Fee</th>
            <th className="p-3.5">Net Payout</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {payments.length > 0 ? (
            payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-slate-100 font-mono">{p.transactionId}</div>
                  <div className="text-[10px] text-slate-500">{p.method}</div>
                </td>
                <td className="p-3.5 font-bold text-amber-400 font-mono">
                  #{p.orderNumber || p.orderId}
                </td>
                <td className="p-3.5 font-bold text-slate-100 font-mono">${p.amount}</td>
                <td className="p-3.5 text-amber-400 font-mono font-bold">+${p.commission}</td>
                <td className="p-3.5 text-purple-400 font-mono">${p.deliveryFee}</td>
                <td className="p-3.5 font-bold text-emerald-400 font-mono">${p.netRestaurantPayout}</td>
                <td className="p-3.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="p-3.5 text-right">
                  {p.status === 'COMPLETED' && (
                    <button
                      onClick={() => onOpenRefund(p)}
                      className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-300 font-bold text-[11px] flex items-center gap-1 ml-auto"
                    >
                      <FiRefreshCcw /> Refund
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                No payment records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
