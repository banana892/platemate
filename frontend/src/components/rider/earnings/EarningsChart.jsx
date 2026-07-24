/**
 * EarningsChart.jsx — Responsive SVG Earnings & Trip Volume Trend Chart (Phase F3)
 */

export default function EarningsChart({ data = null }) {
  const chartPoints = data?.trend || [
    { label: 'Mon', value: 520, trips: 8 },
    { label: 'Tue', value: 640, trips: 10 },
    { label: 'Wed', value: 480, trips: 7 },
    { label: 'Thu', value: 750, trips: 12 },
    { label: 'Fri', value: 890, trips: 14 },
    { label: 'Sat', value: 1120, trips: 18 },
    { label: 'Sun', value: 980, trips: 15 },
  ]

  const maxVal = Math.max(...chartPoints.map((p) => p.value), 1000)

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-gray-900">Earnings & Delivery Trend</h3>
          <p className="text-xs text-gray-400">Daily earnings volume and completed trips</p>
        </div>
        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          +14.5% vs last week
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-gray-100">
        {chartPoints.map((pt, idx) => {
          const heightPercent = Math.round((pt.value / maxVal) * 100)
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
              <div className="text-[0.65rem] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                ₹{pt.value} ({pt.trips} trips)
              </div>
              <div
                className="w-full max-w-[38px] bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 rounded-t-xl group-hover:brightness-110 transition-all duration-500 shadow-sm"
                style={{ height: `${Math.max(heightPercent, 10)}%` }}
              />
              <span className="text-xs font-bold text-gray-500 mt-2">{pt.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
