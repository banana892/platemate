/**
 * OrderDetailsPage.jsx — Deep Order Inspection Page (Phase F4)
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiShoppingBag, FiTruck, FiMapPin, FiX } from 'react-icons/fi'
import useAdminOrders from '../../hooks/useAdminOrders.js'
import OrderTimeline from '../../components/admin/orders/OrderTimeline.jsx'
import StatusBadge from '../../components/admin/users/StatusBadge.jsx'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedOrder, selectOrder, cancelOrder } = useAdminOrders()

  useEffect(() => {
    if (id) {
      selectOrder(id)
    }
  }, [id, selectOrder])

  if (!selectedOrder) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading order inspection data...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors"
      >
        <FiArrowLeft /> Back to Orders
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-amber-400 font-mono">Order #{selectedOrder.orderNumber || selectedOrder.id}</h1>
            <StatusBadge status={selectedOrder.orderStatus} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
        </div>

        {selectedOrder.orderStatus !== 'CANCELLED' && selectedOrder.orderStatus !== 'DELIVERED' && (
          <button
            onClick={() => cancelOrder(selectedOrder.id, 'Administrative Emergency Cancellation')}
            className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FiX /> Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <OrderTimeline timeline={selectedOrder.timeline} currentStatus={selectedOrder.orderStatus} />

          {/* Items Purchased */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</div>
            <div className="divide-y divide-slate-800">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-200">{item.quantity}x {item.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800 space-y-1 font-mono text-slate-300">
              <div className="flex justify-between"><span>Subtotal:</span><span>${selectedOrder.subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee:</span><span>${selectedOrder.deliveryFee}</span></div>
              <div className="flex justify-between"><span>Taxes:</span><span>${selectedOrder.tax}</span></div>
              <div className="flex justify-between text-base font-black text-amber-400 pt-2 border-t border-slate-800">
                <span>Total Amount:</span><span>${selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stakeholders Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stakeholders & Delivery</div>
            
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-200"><FiUser className="text-amber-400" /> Customer</div>
              <div className="text-slate-300">{selectedOrder.customer?.name}</div>
              <div className="text-slate-400 text-[11px]">{selectedOrder.customer?.phone}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-200"><FiShoppingBag className="text-amber-400" /> Restaurant</div>
              <div className="text-slate-300">{selectedOrder.restaurant?.name}</div>
              <div className="text-slate-400 text-[11px]">{selectedOrder.restaurant?.address}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-200"><FiTruck className="text-amber-400" /> Assigned Rider</div>
              <div className="text-slate-300">{selectedOrder.rider?.name || 'Unassigned'}</div>
              <div className="text-slate-400 text-[11px]">{selectedOrder.rider?.vehicle || 'N/A'}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-200"><FiMapPin className="text-amber-400" /> Delivery Address</div>
              <div className="text-slate-300">{selectedOrder.deliveryAddress}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
