/**
 * DeliveryDetailsDrawer.jsx — Complete Order Detail Slide-Over Drawer (Phase F3)
 */

import { FiX, FiPhone, FiCheck, FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import DeliveryStatusBadge from './DeliveryStatusBadge.jsx'
import DeliveryTimeline from './DeliveryTimeline.jsx'
import DeliveryMapWrapper from '../common/DeliveryMapWrapper.jsx'

export default function DeliveryDetailsDrawer({
  isOpen = false,
  onClose,
  delivery = null,
  onStatusChange,
  isLoading = false,
}) {
  if (!isOpen || !delivery) return null

  const {
    id,
    orderNumber = 'ORD-1029',
    status = 'READY_FOR_PICKUP',
    deliveryFee = 65,
    totalAmount = 450,
    items = [],
    restaurant = {},
    user = {},
    deliveryAddress = {},
    notes = '',
  } = delivery

  const restaurantName = restaurant?.name || delivery.restaurantName || 'Tasty Delights'
  const restaurantPhone = restaurant?.phone || '+91 9876543210'
  const customerName = user?.name || delivery.customerName || 'Customer'
  const customerPhone = user?.phone || delivery.customerPhone || '+91 9876543210'
  const dropAddressStr = deliveryAddress?.street
    ? `${deliveryAddress.street}, ${deliveryAddress.city}`
    : delivery.deliveryAddress || 'Koramangala 4th Block, Bengaluru'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-5 bg-gray-900 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Order #{orderNumber}</h3>
                <DeliveryStatusBadge status={status} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Delivery Earnings: ₹{deliveryFee}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-5 space-y-6 flex-1">
            {/* Timeline */}
            <DeliveryTimeline currentStatus={status} />

            {/* Map Wrapper */}
            <DeliveryMapWrapper
              pickupAddress={restaurantName}
              deliveryAddress={dropAddressStr}
              distance="3.2 km"
              estimatedTime="15 mins"
            />

            {/* Contact Action Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Call Restaurant */}
              <a
                href={`tel:${restaurantPhone}`}
                className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 hover:bg-amber-100 transition-colors text-amber-900"
              >
                <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                  <FiPhone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[0.65rem] font-bold text-amber-700 uppercase tracking-wider block">Call Merchant</span>
                  <span className="text-xs font-black truncate block max-w-[120px]">{restaurantName}</span>
                </div>
              </a>

              {/* Call Customer */}
              <a
                href={`tel:${customerPhone}`}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 hover:bg-emerald-100 transition-colors text-emerald-900"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                  <FiPhone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider block">Call Customer</span>
                  <span className="text-xs font-black truncate block max-w-[120px]">{customerName}</span>
                </div>
              </a>
            </div>

            {/* Order Items & Bill Breakdown */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4 text-orange-500" />
                <span>Order Items ({items.length || 2})</span>
              </h4>
              <div className="divide-y divide-gray-200/60 text-xs">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        {item.quantity}x {item.name || item.menuItem?.name}
                      </span>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">2x Paneer Butter Masala</span>
                      <span className="font-bold text-gray-900">₹320</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">3x Garlic Naan</span>
                      <span className="font-bold text-gray-900">₹130</span>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-black text-sm text-gray-900">
                <span>Total Order Value</span>
                <span className="text-orange-600">₹{totalAmount}</span>
              </div>
            </div>

            {/* Special Instructions */}
            {notes && (
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[0.65rem] block text-amber-700">Special Instructions</span>
                <p>{notes}</p>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
            {status === 'READY_FOR_PICKUP' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onStatusChange && onStatusChange(id, 'OUT_FOR_DELIVERY')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Start Pickup & Delivery</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}

            {status === 'OUT_FOR_DELIVERY' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onStatusChange && onStatusChange(id, 'DELIVERED')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FiCheck className="w-4 h-4" />
                <span>Confirm Order Delivered</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
