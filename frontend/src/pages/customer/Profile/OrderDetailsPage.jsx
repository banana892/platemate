/**
 * OrderDetailsPage.jsx — Full Order Details & Tracking Page (/profile/orders/:id)
 */

import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiShoppingBag, FiMapPin, FiCreditCard, FiClock } from 'react-icons/fi'
import OrderTimeline from '../../../components/customer/OrderTimeline.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useOrders from '../../../hooks/useOrders.js'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const { activeOrder, loadingDetails, errorDetails, fetchOrderDetails } = useOrders()

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id).catch(() => {})
    }
  }, [id, fetchOrderDetails])

  if (loadingDetails && !activeOrder) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  if (errorDetails || !activeOrder) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
        <p className="text-sm text-gray-500 mb-6">{errorDetails || "We couldn't find the requested order."}</p>
        <Link
          to="/profile/orders"
          className="gradient-bg text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth inline-flex items-center gap-2"
        >
          <FiArrowLeft />
          <span>Back to Order History</span>
        </Link>
      </div>
    )
  }

  const order = activeOrder
  const restaurant = order.restaurant || {}
  const address = order.deliveryAddress || order.address || {}
  const items = order.items || order.orderItems || []

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            to="/profile/orders"
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-smooth"
            aria-label="Back to orders"
          >
            <FiArrowLeft className="text-lg" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Order #{order.orderNumber || order.id?.slice(0, 8)}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <FiClock className="text-gray-400" />
              <span>Placed on {formattedDate}</span>
            </div>
          </div>
        </div>

        <span className="self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-[#FF4F5A] border border-rose-200">
          Status: {order.status}
        </span>
      </div>

      {/* Visual Status Timeline */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Progress</h3>
        <OrderTimeline currentStatus={order.status} />
      </div>

      {/* Grid: Restaurant & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
            <FiShoppingBag className="text-[#FF4F5A]" />
            <span>Restaurant Details</span>
          </div>
          <h4 className="text-lg font-bold text-gray-900">{restaurant.name || 'Partner Restaurant'}</h4>
          <p className="text-xs text-gray-500">{restaurant.address || 'Address on file'}</p>
          {restaurant.phone && <p className="text-xs text-gray-500">Contact: {restaurant.phone}</p>}
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
            <FiMapPin className="text-emerald-500" />
            <span>Delivery Destination</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900">{address.recipientName || 'Customer'}</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {address.street || address.address}, {address.city}, {address.state} — {address.postalCode}
          </p>
          {address.recipientPhone && <p className="text-xs text-gray-500">Phone: {address.recipientPhone}</p>}
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-bold text-gray-900">Ordered Items ({items.length})</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item, idx) => {
            const name = item.menuItem?.name || item.name || 'Item'
            const price = item.price || item.unitPrice || 0
            const quantity = item.quantity || 1
            const itemTotal = price * quantity

            return (
              <div key={idx} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 text-[#FF4F5A] text-xs font-extrabold flex items-center justify-center">
                    {quantity}x
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">₹{price} per unit</p>
                  </div>
                </div>

                <span className="text-sm font-bold text-gray-900">₹{itemTotal}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md ml-auto space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FiCreditCard className="text-gray-400" />
          <span>Payment Breakdown</span>
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal || order.totalAmount || 0}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount</span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>₹{order.deliveryFee || 49}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Taxes & Charges</span>
            <span>₹{order.taxAmount || 25}</span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between font-extrabold text-lg text-gray-900">
            <span>Grand Total</span>
            <span className="text-[#FF4F5A]">₹{order.totalAmount || order.total}</span>
          </div>

          <div className="pt-2 text-xs text-gray-500 flex justify-between items-center">
            <span>Payment Method</span>
            <span className="font-bold uppercase text-gray-800">{order.paymentMethod || 'COD'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
