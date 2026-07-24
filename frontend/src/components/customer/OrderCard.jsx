/**
 * OrderCard.jsx — Order Summary Card for Order History List
 */

import { Link } from 'react-router-dom'
import { FiShoppingBag, FiCalendar, FiArrowRight, FiClock, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi'

const STATUS_CONFIG = {
  PENDING: { label: 'Placed', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: FiClock },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: FiCheckCircle },
  PREPARING: { label: 'Preparing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FiClock },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: FiTruck },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FiCheckCircle },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: FiXCircle },
}

export default function OrderCard({ order }) {
  if (!order) return null

  const status = STATUS_CONFIG[order.status?.toUpperCase()] || STATUS_CONFIG.PENDING
  const StatusIcon = status.icon

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  const restaurantName = order.restaurant?.name || order.items?.[0]?.menuItem?.restaurant?.name || 'Restaurant'


  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-card transition-smooth flex flex-col justify-between">
      <div>
        {/* Header: Restaurant & Status */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiShoppingBag className="text-[#FF4F5A] text-lg flex-shrink-0" />
              <h3 className="font-bold text-gray-900 text-lg hover:text-[#FF4F5A] transition-smooth">
                {restaurantName}
              </h3>
            </div>
            <p className="text-xs font-semibold text-gray-400">
              Order #{order.orderNumber || order.id?.slice(0, 8)}
            </p>
          </div>

          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${status.bg}`}>
            <StatusIcon className="text-xs" />
            <span>{status.label}</span>
          </span>
        </div>

        {/* Date & Items Summary */}
        <div className="space-y-2 mb-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <FiCalendar className="text-gray-400" />
            <span>{orderDate}</span>
          </div>

          {order.items && order.items.length > 0 && (
            <p className="text-sm text-gray-700 line-clamp-1 font-normal pt-1">
              {order.items.map((i) => i.menuItem?.name || i.name).filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Price & View Details Link */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
        <div>
          <span className="text-xs text-gray-400 block font-medium">Total Amount</span>
          <span className="text-lg font-extrabold text-gray-900">
            ₹{order.totalAmount || order.total || '0'}
          </span>
        </div>

        <Link
          to={`/profile/orders/${order.id}`}
          className="gradient-bg text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-glow transition-smooth flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Details</span>
          <FiArrowRight className="text-sm" />
        </Link>
      </div>
    </div>
  )
}
