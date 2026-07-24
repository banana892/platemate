/**
 * RevenueChart.jsx — Responsive SVG Sales & Revenue Trend Chart Component
 */

export default function RevenueChart({ data = null }) {
  const defaultPoints = [
    { label: 'Mon', value: 3400 },
    { label: 'Tue', value: 4200 },
    { label: 'Wed', value: 3800 },
    { label: 'Thu', value: 5100 },
    { label: 'Fri', value: 6800 },
    { label: 'Sat', value: 8900 },
    { label: 'Sun', value: 7400 },
  ]

  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.trend)
    ? data.trend
    : Array.isArray(data?.salesTrend)
    ? data.salesTrend
    : defaultPoints

  const chartPoints = rawList.map((pt) => ({
    label: pt?.label || pt?.day || pt?.date || 'Day',
    value: Number(pt?.value || pt?.amount || pt?.revenue || 0),
  }))

  const maxVal = Math.max(...chartPoints.map((p) => p.value), 1000)

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base">Revenue & Sales Trend</h3>
          <p className="text-xs text-gray-400 font-medium">Daily order sales volume</p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          +18.4% vs last week
        </span>
      </div>

      {/* Responsive Bar Chart */}
      <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-gray-100">
        {chartPoints.map((pt, idx) => {
          const heightPercent = Math.round((pt.value / maxVal) * 100)
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="text-[0.68rem] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-smooth mb-1">
                ₹{pt.value}
              </div>
              <div
                className="w-full max-w-[36px] bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl group-hover:brightness-110 transition-all duration-500"
                style={{ height: `${Math.max(heightPercent, 8)}%` }}
              />
              <span className="text-xs font-bold text-gray-500 mt-2">{pt.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
