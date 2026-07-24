/**
 * DashboardPage.jsx — Main Operations Overview Dashboard (Phase F4)
 */

import { useEffect } from 'react'
import useAdminDashboard from '../../../hooks/useAdminDashboard.js'
import useSystemHealth from '../../../hooks/useSystemHealth.js'
import StatisticsGrid from '../../../components/admin/dashboard/StatisticsGrid.jsx'
import RevenueChart from '../../../components/admin/dashboard/RevenueChart.jsx'
import OrdersChart from '../../../components/admin/dashboard/OrdersChart.jsx'
import UsersChart from '../../../components/admin/dashboard/UsersChart.jsx'
import RecentActivity from '../../../components/admin/dashboard/RecentActivity.jsx'
import UnifiedActivityTimeline from '../../../components/admin/dashboard/UnifiedActivityTimeline.jsx'
import QuickActions from '../../../components/admin/dashboard/QuickActions.jsx'
import OperationalAlertCenter from '../../../components/admin/common/OperationalAlertCenter.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'

export default function DashboardPage() {
  const { dashboardData, operationalAlerts, loading, fetchDashboard } = useAdminDashboard()
  const { auditLogs, fetchLogs } = useSystemHealth()

  useEffect(() => {
    fetchDashboard()
    fetchLogs()
  }, [fetchDashboard, fetchLogs])

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">Operations Control Center</h1>
          <p className="text-xs text-slate-400">Real-time platform activity, revenue telemetry, and system status</p>
        </div>
      </div>

      {/* Operational Alerts Ticker */}
      <OperationalAlertCenter alerts={operationalAlerts} />

      {/* KPI Stats Grid */}
      <StatisticsGrid stats={dashboardData} />

      {/* Quick Action Toolbar */}
      <QuickActions />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={dashboardData?.revenueChart} />
        </div>
        <div>
          <OrdersChart />
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <UsersChart />
        </div>
        <div>
          <RecentActivity registrations={dashboardData?.recentRegistrations} />
        </div>
        <div>
          <UnifiedActivityTimeline auditLogs={auditLogs?.items} />
        </div>
      </div>
    </div>
  )
}
