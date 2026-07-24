/**
 * OrdersTable.jsx — Live Partner Orders List & Status Transition Controls
 */

import { FiEye } from 'react-icons/fi'

const STATUS_NEXT_ACTION = {
  PENDING: { nextStatus: 'CONFIRMED', label: 'Accept Order', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  CONFIRMED: { nextStatus: 'PREPARING', label: 'Start Preparing', bg: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  PREPARING: { nextStatus: 'READY', label: 'Mark Ready', bg: 'bg-amber-600 hover:bg-amber-700 text-white' },
  READY: { nextStatus: 'OUT_FOR_DELIVERY', label: 'Hand to Rider', bg: 'bg-purple-600 hover:bg-purple-700 text-white' },
  OUT_FOR_DELIVERY: { nextStatus: 'DELIVERED', label: 'Mark Delivered', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
}

export default function OrdersTable({
  orders = [],
  onSelectOrder,
  onUpdateStatus,
  loading = false,
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center text-2xl mb-3">
          📦
        </div>
        <h4 className="font-bold text-gray-900 text-base mb-1">No Orders Found</h4>
        <p className="text-xs text-gray-500">Live order requests will appear here automatically.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {orders.map((order) => {
              const action = STATUS_NEXT_ACTION[order.status]
              const itemsCount = order.items?.length || order.orderItems?.length || 1

              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-smooth">
                  <td className="py-4 px-6 font-bold text-gray-900">
                    #{order.orderNumber || order.id?.slice(0, 8)}
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-800 text-xs">{order.user?.name || order.customerName || 'Customer'}</p>
                    <p className="text-[0.7rem] text-gray-400">{order.user?.phone || 'Phone unavailable'}</p>
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-gray-600">
                    {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                  </td>

                  <td className="py-4 px-4 font-extrabold text-gray-900">
                    ₹{order.totalAmount || order.total}
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-extrabold uppercase border bg-orange-50 text-orange-700 border-orange-200">
                      {order.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-smooth cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="text-base" />
                      </button>

                      {action && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, action.nextStatus)}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-smooth shadow-xs cursor-pointer ${action.bg}`}
                        >
                          {action.label}
                        </button>
                      )}

                      {['PENDING', 'CONFIRMED'].includes(order.status) && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-smooth cursor-pointer"
                          title="Reject / Cancel"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
