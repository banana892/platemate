/**
 * DashboardPage.jsx — Restaurant Partner Overview Dashboard (/partner)
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiPlus, FiArrowRight } from 'react-icons/fi'
import RestaurantHeader from '../../../components/partner/RestaurantHeader.jsx'
import DashboardStats from '../../../components/partner/DashboardStats.jsx'
import RevenueChart from '../../../components/partner/RevenueChart.jsx'
import OrderStatusChart from '../../../components/partner/OrderStatusChart.jsx'
import OrdersTable from '../../../components/partner/OrdersTable.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useRestaurant from '../../../hooks/useRestaurant.js'
import usePartnerOrders from '../../../hooks/usePartnerOrders.js'

export default function DashboardPage() {
  const { restaurant, dashboard, loadingDashboard, fetchDashboard, toggleRestaurantOpen } = useRestaurant()
  const { orders, updateOrderStatus, selectOrder } = usePartnerOrders()

  useEffect(() => {
    fetchDashboard().catch(() => {})
  }, [fetchDashboard])

  if (loadingDashboard && !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" className="h-28" count={6} />
        </div>
      </div>
    )
  }

  const recentOrders = orders?.slice(0, 5) || dashboard?.recentOrders || []
  const topDishes = dashboard?.topDishes || [
    { name: 'Butter Chicken Special', count: 48, revenue: '₹14,400' },
    { name: 'Paneer Tikka Masala', count: 35, revenue: '₹8,750' },
    { name: 'Garlic Naan (Basket)', count: 92, revenue: '₹4,600' },
  ]

  return (
    <div className="space-y-8">
      {/* Restaurant Header Banner */}
      <RestaurantHeader
        restaurant={restaurant || dashboard?.restaurant}
        onToggleOpen={toggleRestaurantOpen}
      />

      {/* Top Metric Cards */}
      <DashboardStats dashboard={dashboard} restaurant={restaurant || dashboard?.restaurant} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={dashboard?.salesTrend} />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart breakdown={dashboard?.statusBreakdown} />
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-glow">
        <div>
          <h3 className="font-extrabold text-lg">Merchant Quick Shortcuts</h3>
          <p className="text-xs text-white/80">Manage your menu items, categories, or store hours</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/partner/menu/new"
            className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-50 transition-smooth flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FiPlus /> Add Menu Item
          </Link>
          <Link
            to="/partner/categories/new"
            className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition-smooth flex items-center gap-1.5 cursor-pointer"
          >
            <FiPlus /> Add Category
          </Link>
          <Link
            to="/partner/business-hours"
            className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition-smooth flex items-center gap-1.5 cursor-pointer"
          >
            <FiClock /> Business Hours
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Recent Live Orders</h3>
            <p className="text-xs text-gray-500">Incoming delivery requests requiring action</p>
          </div>
          <Link
            to="/partner/orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-smooth flex items-center gap-1"
          >
            <span>View All Orders</span>
            <FiArrowRight />
          </Link>
        </div>

        <OrdersTable
          orders={recentOrders}
          onSelectOrder={selectOrder}
          onUpdateStatus={updateOrderStatus}
        />
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">🔥 Top Selling Dishes Today</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topDishes.map((dish, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-gray-900 line-clamp-1">{dish.name}</p>
                <p className="text-xs text-gray-400 font-semibold">{dish.count} orders placed</p>
              </div>
              <span className="font-extrabold text-sm text-emerald-600">{dish.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
