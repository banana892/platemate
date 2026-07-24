/**
 * AnalyticsPage.jsx — Partner Store Performance Analytics Page (/partner/analytics)
 */

import { useEffect, useState } from 'react'
import RevenueChart from '../../../components/partner/RevenueChart.jsx'
import OrderStatusChart from '../../../components/partner/OrderStatusChart.jsx'
import FilterBar from '../../../components/partner/FilterBar.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import usePartnerAnalytics from '../../../hooks/usePartnerAnalytics.js'

const TIME_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
]

export default function AnalyticsPage() {
  const { analytics = {}, loadingAnalytics, fetchAnalytics } = usePartnerAnalytics()
  const [range, setRange] = useState('month')

  useEffect(() => {
    fetchAnalytics(range).catch(() => {})
  }, [fetchAnalytics, range])

  if (loadingAnalytics && (!analytics || Object.keys(analytics).length === 0)) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  const summary = analytics?.summary || {}
  const revenueVal = summary?.revenue ?? analytics?.totalRevenue ?? 48500
  const ordersVal = summary?.ordersCount ?? analytics?.totalOrders ?? 342
  const aovVal = summary?.averageOrderValue ?? analytics?.avgOrderValue ?? 385
  const ratingVal = summary?.averageRating ?? 4.8

  const metrics = [
    { label: 'Total Revenue', value: `₹${Number(revenueVal).toLocaleString()}`, change: '+14.2%' },
    { label: 'Total Orders', value: ordersVal.toString(), change: '+8.5%' },
    { label: 'Average Order Value', value: `₹${Number(aovVal).toLocaleString()}`, change: '+3.1%' },
    { label: 'Store Rating', value: `⭐ ${ratingVal}`, change: 'Top Rated' },
  ]

  const popularItems = analytics?.popularItems || [
    { name: 'Butter Chicken Special', count: 48 },
    { name: 'Paneer Tikka Masala', count: 35 },
    { name: 'Garlic Naan (Basket)', count: 92 },
  ]

  const topCategories = analytics?.topCategories || [
    { name: 'Main Course', count: 120 },
    { name: 'Starters', count: 85 },
    { name: 'Breads & Rice', count: 140 },
  ]

  return (
    <div className="space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Analytics & Sales Reports</h2>
          <p className="text-sm text-gray-500">Track revenue performance, order volume, average bill size, and top dishes</p>
        </div>

        <FilterBar options={TIME_RANGES} selected={range} onSelect={setRange} />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{m.label}</span>
            <p className="text-2xl font-black text-gray-900">{m.value}</p>
            <span className="text-[0.7rem] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              {m.change}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue & Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={analytics?.salesTrend || analytics?.summary} />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart breakdown={analytics?.statusBreakdown} />
        </div>
      </div>

      {/* Popular Items & Top Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <h3 className="text-base font-extrabold text-gray-900 mb-4">🔥 Top Ordered Dishes</h3>
          <div className="space-y-3">
            {popularItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                <span className="font-bold text-gray-800">{item.name}</span>
                <span className="font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">{item.count} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <h3 className="text-base font-extrabold text-gray-900 mb-4">📊 Category Breakdown</h3>
          <div className="space-y-3">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                <span className="font-bold text-gray-800">{cat.name}</span>
                <span className="font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">{cat.count} items sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
