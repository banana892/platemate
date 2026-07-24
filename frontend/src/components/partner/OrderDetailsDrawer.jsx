/**
 * OrderDetailsDrawer.jsx — Slide-Over Drawer for Order Details
 */

import { FiX, FiUser, FiPhone, FiMapPin } from 'react-icons/fi'

export default function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  loading = false,
}) {
  if (!isOpen || !order) return null

  const items = order.items || order.orderItems || []
  const address = order.deliveryAddress || order.address || {}
  const customer = order.user || {}

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full shadow-card-hover border-l border-gray-100 flex flex-col justify-between overflow-y-auto animate-slide-in-right p-6 sm:p-8">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                Order #{order.orderNumber || order.id?.slice(0, 8)}
              </h3>
              <span className="text-xs font-semibold text-gray-400">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-smooth cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Customer & Address */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <FiUser className="text-orange-600" />
                <span>Customer</span>
              </div>
              <p className="font-bold text-gray-900 text-sm">{customer.name || 'Customer'}</p>
              {customer.phone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <FiPhone className="text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <FiMapPin className="text-emerald-600" />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {address.street || address.address}, {address.city}, {address.state} — {address.postalCode}
              </p>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="mb-6 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Items Ordered ({items.length})
            </h4>

            <div className="divide-y divide-gray-100 bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-[0.7rem]">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-gray-900">{item.menuItem?.name || item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    ₹{(item.price || item.unitPrice || 0) * (item.quantity || 1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Total */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal || order.totalAmount}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total</span>
              <span className="text-orange-600">₹{order.totalAmount || order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex gap-3">
          {order.status === 'PENDING' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'CONFIRMED')
                onClose()
              }}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-smooth cursor-pointer"
            >
              Accept Order
            </button>
          )}

          {order.status === 'CONFIRMED' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'PREPARING')
                onClose()
              }}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-smooth cursor-pointer"
            >
              Start Preparing
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'READY')
                onClose()
              }}
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-700 transition-smooth cursor-pointer"
            >
              Mark Order Ready
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
