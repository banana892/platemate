/**
 * OrdersTable.jsx — Master Order Monitoring Data Table (Phase F4)
 */

import StatusBadge from '../users/StatusBadge.jsx'
import { FiEye, FiX } from 'react-icons/fi'

export default function OrdersTable({ orders = [], onViewDetails, onCancelOrder }) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
      <table className="w-full text-left border-collapse text-xs text-slate-200">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="p-3.5">Order ID</th>
            <th className="p-3.5">Customer</th>
            <th className="p-3.5">Restaurant</th>
            <th className="p-3.5">Assigned Rider</th>
            <th className="p-3.5">Amount & Payment</th>
            <th className="p-3.5">Fulfillment Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-amber-400 font-mono">#{o.orderNumber || o.id}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(o.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="p-3.5">
                  <div className="font-bold text-slate-100">{o.customerName}</div>
                  <div className="text-[11px] text-slate-400">{o.customerPhone}</div>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-slate-200">{o.restaurantName}</div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {o.riderName || 'Unassigned'}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="font-bold text-emerald-400 font-mono">${o.totalAmount}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{o.paymentStatus} ({o.paymentMethod})</span>
                </td>
                <td className="p-3.5">
                  <StatusBadge status={o.orderStatus} />
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(o)}
                      title="Inspect Order Details"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                    >
                      <FiEye className="text-base" />
                    </button>
                    {o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED' && (
                      <button
                        onClick={() => onCancelOrder(o.id, 'Cancelled by Admin')}
                        title="Emergency Cancel Order"
                        className="p-1.5 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400"
                      >
                        <FiX className="text-base" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
