/**
 * PerformancePage.jsx — Rider Performance Dashboard (/rider/performance)
 */

import { useEffect } from 'react'
import usePerformance from '../../hooks/usePerformance.js'
import PerformanceCard from '../../components/rider/performance/PerformanceCard.jsx'
import PerformanceTrends from '../../components/rider/performance/PerformanceTrends.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function PerformancePage() {
  const { analytics, loading, loadAnalytics } = usePerformance()

  useEffect(() => {
    loadAnalytics().catch(() => {})
  }, [loadAnalytics])

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Performance & Rating</h1>
        <p className="text-xs text-gray-500 font-medium">Monitor your order acceptance rate, completion speed, customer feedback, and high-demand hotspots.</p>
      </div>

      {/* Metrics Grid */}
      <PerformanceCard metrics={analytics || {}} />

      {/* Trends & Heatmap Grid */}
      <PerformanceTrends />
    </div>
  )
}
