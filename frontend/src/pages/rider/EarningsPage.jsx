/**
 * EarningsPage.jsx — Comprehensive Rider Earnings Center (/rider/earnings)
 */

import { useEffect, useState } from 'react'
import useEarnings from '../../hooks/useEarnings.js'
import EarningsSummary from '../../components/rider/earnings/EarningsSummary.jsx'
import EarningsBreakdown from '../../components/rider/earnings/EarningsBreakdown.jsx'
import EarningsChart from '../../components/rider/earnings/EarningsChart.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

export default function EarningsPage() {
  const { earnings, loading, loadEarnings } = useEarnings()
  const [range, setRange] = useState('week')

  useEffect(() => {
    loadEarnings({ range }).catch(() => {})
  }, [range, loadEarnings])

  if (loading && !earnings) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Earnings Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium">Track your daily payouts, customer tips, and incentive bonuses.</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl self-start sm:self-auto">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                range === r.id ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <EarningsSummary earnings={earnings || {}} />

      {/* Chart & Itemized Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EarningsChart data={earnings} />
        </div>
        <div className="lg:col-span-1">
          <EarningsBreakdown breakdown={earnings?.breakdown || {}} />
        </div>
      </div>
    </div>
  )
}
