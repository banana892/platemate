/**
 * AnalyticsPage.jsx — Comprehensive Platform Analytics Page (Phase F4)
 */

import { useEffect } from 'react'
import useAnalytics from '../../hooks/useAnalytics.js'
import AnalyticsCards from '../../components/admin/analytics/AnalyticsCards.jsx'
import TopRestaurants from '../../components/admin/analytics/TopRestaurants.jsx'
import TopRiders from '../../components/admin/analytics/TopRiders.jsx'
import HeatMapPlaceholder from '../../components/admin/analytics/HeatMapPlaceholder.jsx'
import RevenueChart from '../../components/admin/dashboard/RevenueChart.jsx'
import { FiDownload } from 'react-icons/fi'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function AnalyticsPage() {
  const { analytics, loading, fetchAnalytics, exportReport } = useAnalytics()

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">Platform Analytics & Intelligence</h1>
          <p className="text-xs text-slate-400">Financial telemetry, demand heatmaps, and top performance metrics</p>
        </div>
        <button
          onClick={() => exportReport('analytics_full')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
        >
          <FiDownload /> Export Full Analytics CSV
        </button>
      </div>

      {/* Metric Cards */}
      <AnalyticsCards />

      {/* Revenue & Growth Chart */}
      <RevenueChart data={analytics?.revenueChart} />

      {/* Heat Map & Leaderboards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HeatMapPlaceholder />
        </div>
        <div className="space-y-6">
          <TopRestaurants list={analytics?.topRestaurants} />
          <TopRiders list={analytics?.topRiders} />
        </div>
      </div>
    </div>
  )
}
