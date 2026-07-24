/**
 * DeliveryCard.jsx — Active Delivery Order Card with Priority Indicators (Phase F3)
 */

import { FiMapPin, FiNavigation, FiDollarSign, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi'
import DeliveryStatusBadge from './DeliveryStatusBadge.jsx'

export default function DeliveryCard({
  delivery = {},
  onSelect,
  onStatusChange,
  isLoading = false,
}) {
  const {
    id,
    orderNumber = 'ORD-1029',
    status = 'READY_FOR_PICKUP',
    deliveryFee = 65,
    restaurant = {},
    user = {},
    deliveryAddress = {},
    createdAt,
  } = delivery

  // Priority indicator logic (e.g. URGENT if older than 25 mins or assigned express)
  const getPriority = () => {
    const ageMins = createdAt ? (new Date() - new Date(createdAt)) / (1000 * 60) : 10
    if (ageMins > 30) return { label: 'URGENT', class: 'bg-rose-500 text-white' }
    if (ageMins > 15) return { label: 'HIGH PRIORITY', class: 'bg-amber-500 text-white' }
    return { label: 'STANDARD', class: 'bg-slate-700 text-white' }
  }

  const priority = getPriority()

  const restaurantName = restaurant?.name || delivery.restaurantName || 'Tasty Delights'
  const customerName = user?.name || delivery.customerName || 'Customer'
  const dropAddressStr = deliveryAddress?.street
    ? `${deliveryAddress.street}, ${deliveryAddress.city}`
    : delivery.deliveryAddress || 'Koramangala 4th Block, Bengaluru'

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden">
      {/* Header: Priority Badge & Status */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[0.6rem] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${priority.class}`}>
            {priority.label}
          </span>
          <span className="text-xs font-black text-gray-900">#{orderNumber}</span>
        </div>
        <DeliveryStatusBadge status={status} />
      </div>

      {/* Pickup & Drop Address Info */}
      <div className="space-y-3">
        {/* Pickup Restaurant */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0 mt-0.5">
            <FiMapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">Pickup From</span>
            <h4 className="text-sm font-extrabold text-gray-900 truncate">{restaurantName}</h4>
            <p className="text-xs text-gray-500 truncate">{restaurant?.address || 'MG Road, Indiranagar'}</p>
          </div>
        </div>

        {/* Drop Location */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
            <FiNavigation className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">Deliver To</span>
            <h4 className="text-sm font-extrabold text-gray-900 truncate">{customerName}</h4>
            <p className="text-xs text-gray-500 truncate">{dropAddressStr}</p>
          </div>
        </div>
      </div>

      {/* Trip Financials & Distance */}
      <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-700">
        <div className="flex items-center gap-1.5 text-emerald-600">
          <FiDollarSign className="w-4 h-4" />
          <span>Earnings: ₹{deliveryFee}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <FiClock className="w-3.5 h-3.5" />
          <span>~2.8 km (15 mins)</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSelect && onSelect(delivery)}
          className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
        >
          View Details
        </button>

        {status === 'READY_FOR_PICKUP' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onStatusChange && onStatusChange(id, 'OUT_FOR_DELIVERY')}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>Start Delivery</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        )}

        {status === 'OUT_FOR_DELIVERY' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onStatusChange && onStatusChange(id, 'DELIVERED')}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FiCheck className="w-4 h-4" />
            <span>Mark Delivered</span>
          </button>
        )}
      </div>
    </div>
  )
}
