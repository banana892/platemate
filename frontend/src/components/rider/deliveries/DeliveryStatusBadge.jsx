/**
 * DeliveryStatusBadge.jsx — Color-Coded Delivery Status Badge (Phase F3)
 */

const STATUS_MAP = {
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    class: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    class: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  DELIVERED: {
    label: 'Delivered',
    class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    class: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  PENDING: {
    label: 'Pending Pickup',
    class: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
}

export default function DeliveryStatusBadge({ status = 'PENDING', className = '' }) {
  const config = STATUS_MAP[status] || STATUS_MAP.PENDING

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.class} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  )
}
