/**
 * OrderStatusChart.jsx — Order Status Breakdown Progress Chart Component
 */

export default function OrderStatusChart({ breakdown = null }) {
  const statuses = [
    { label: 'Delivered', count: Number(breakdown?.delivered ?? breakdown?.DELIVERED ?? 28), color: 'bg-emerald-500' },
    { label: 'Preparing', count: Number(breakdown?.preparing ?? breakdown?.PREPARING ?? 4), color: 'bg-[#FF4F5A]' },
    { label: 'Out for Delivery', count: Number(breakdown?.outForDelivery ?? breakdown?.OUT_FOR_DELIVERY ?? 3), color: 'bg-purple-500' },
    { label: 'Cancelled', count: Number(breakdown?.cancelled ?? breakdown?.CANCELLED ?? 1), color: 'bg-rose-400' },
  ]

  const total = statuses.reduce((acc, s) => acc + (s.count || 0), 0) || 1

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
      <div className="mb-4">
        <h3 className="font-extrabold text-gray-900 text-base">Order Status Breakdown</h3>
        <p className="text-xs text-gray-400 font-medium">Distribution of orders by state</p>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex my-6">
        {statuses.map((s, idx) => {
          const pct = Math.round((s.count / total) * 100)
          return (
            <div
              key={idx}
              className={`${s.color} h-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${s.count}`}
            />
          )
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${s.color}`} />
              <span className="font-semibold text-gray-700">{s.label}</span>
            </div>
            <span className="font-extrabold text-gray-900">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
