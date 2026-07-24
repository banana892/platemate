import React from 'react'

export function MetricCard({ icon, label, value, change, trend = 'neutral', subtitle, className = '' }) {
  const trendColors = {
    up: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    down: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    neutral: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300',
  }

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="p-2.5 rounded-xl bg-red-50 text-[#FF4F5A] dark:bg-slate-800 dark:text-[#FF6B35]">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{value}</span>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-lg ${trendColors[trend] || trendColors.neutral}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtitle}</p>}
    </div>
  )
}

export default MetricCard
