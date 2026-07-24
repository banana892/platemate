/**
 * OrderDetailsPage.jsx — Standalone Order Details Page (/partner/orders/:id)
 */

import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiMapPin } from 'react-icons/fi'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import usePartnerOrders from '../../../hooks/usePartnerOrders.js'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const { orders, activeOrder, loading, fetchOrders, _updateOrderStatus, selectOrder } = usePartnerOrders()

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders().catch(() => {})
    }
  }, [orders, fetchOrders])

  useEffect(() => {
    if (id && orders.length > 0) {
      const found = orders.find((o) => o.id === id)
      if (found) selectOrder(found)
    }
  }, [id, orders, selectOrder])

  const order = activeOrder || orders.find((o) => o.id === id)

  if (loading && !order) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
        <p className="text-xs text-gray-500 mb-4">The requested order details could not be loaded.</p>
        <Link to="/partner/orders" className="text-xs font-bold text-orange-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    )
  }

  const items = order.items || order.orderItems || []
  const customer = order.user || {}
  const address = order.deliveryAddress || order.address || {}

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
        <Link to="/partner/orders" className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
          <FiArrowLeft className="text-lg" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Order #{order.orderNumber || order.id?.slice(0, 8)}</h2>
          <p className="text-xs text-gray-500 font-medium">Placed on {new Date(order.createdAt || Date.now()).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <FiUser className="text-orange-600" />
            <span>Customer Info</span>
          </div>
          <p className="font-bold text-gray-900 text-sm">{customer.name || 'Customer'}</p>
          {customer.phone && <p className="text-xs text-gray-600">Phone: {customer.phone}</p>}
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <FiMapPin className="text-emerald-600" />
            <span>Delivery Address</span>
          </div>
          <p className="text-xs text-gray-700 font-medium">
            {address.street || address.address}, {address.city}, {address.state} — {address.postalCode}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-100 font-bold text-xs uppercase text-gray-500">
          Items Ordered ({items.length})
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs font-semibold text-gray-800">
              <span>{item.quantity}x {item.menuItem?.name || item.name}</span>
              <span className="font-bold">₹{(item.price || item.unitPrice || 0) * (item.quantity || 1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
