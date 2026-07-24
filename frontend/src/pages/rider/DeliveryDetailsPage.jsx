/**
 * DeliveryDetailsPage.jsx — Standalone Delivery Detail Page (/rider/deliveries/:id)
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useDeliveries from '../../hooks/useDeliveries.js'
import DeliveryTimeline from '../../components/rider/deliveries/DeliveryTimeline.jsx'
import DeliveryStatusBadge from '../../components/rider/deliveries/DeliveryStatusBadge.jsx'
import DeliveryMapWrapper from '../../components/rider/common/DeliveryMapWrapper.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPhone, FiShoppingBag, FiCheck, FiArrowRight } from 'react-icons/fi'

export default function DeliveryDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedDelivery, loading, actionLoading, loadDeliveryDetails, changeDeliveryStatus } = useDeliveries()

  useEffect(() => {
    if (id) {
      loadDeliveryDetails(id).catch(() => {})
    }
  }, [id, loadDeliveryDetails])

  const handleStatusChange = async (newStatus) => {
    try {
      await changeDeliveryStatus(id, newStatus)
      toast.success(`Delivery status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err || 'Failed to update status')
    }
  }

  if (loading && !selectedDelivery) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-40" />
      </div>
    )
  }

  const delivery = selectedDelivery || {
    id,
    orderNumber: 'ORD-1029',
    status: 'READY_FOR_PICKUP',
    deliveryFee: 65,
    totalAmount: 450,
    restaurant: { name: 'Tasty Delights', phone: '+91 9876543210' },
    user: { name: 'Rahul Sharma', phone: '+91 9123456789' },
    deliveryAddress: { street: 'Koramangala 4th Block', city: 'Bengaluru' },
    items: [
      { quantity: 2, name: 'Paneer Butter Masala', price: 160 },
      { quantity: 3, name: 'Garlic Naan', price: 40 },
    ],
  }

  const { status, orderNumber, deliveryFee, totalAmount, restaurant, user, deliveryAddress, items } = delivery
  const dropAddressStr = deliveryAddress?.street
    ? `${deliveryAddress.street}, ${deliveryAddress.city}`
    : 'Koramangala 4th Block, Bengaluru'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">Order #{orderNumber}</h1>
            <DeliveryStatusBadge status={status} />
          </div>
          <p className="text-xs text-gray-500 font-medium">Earnings: ₹{deliveryFee}</p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
        <DeliveryTimeline currentStatus={status} />
      </div>

      {/* Map Representation */}
      <DeliveryMapWrapper
        pickupAddress={restaurant?.name || 'Restaurant Location'}
        deliveryAddress={dropAddressStr}
        distance="3.2 km"
        estimatedTime="15 mins"
      />

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`tel:${restaurant?.phone || '+919876543210'}`}
          className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between hover:bg-amber-100 transition-colors text-amber-900"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-white">
              <FiPhone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[0.65rem] font-bold text-amber-700 uppercase tracking-wider block">Pickup Merchant</span>
              <span className="text-sm font-black">{restaurant?.name || 'Restaurant'}</span>
            </div>
          </div>
          <span className="text-xs font-bold underline">Call</span>
        </a>

        <a
          href={`tel:${user?.phone || '+919876543210'}`}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-between hover:bg-emerald-100 transition-colors text-emerald-900"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500 text-white">
              <FiPhone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider block">Drop Customer</span>
              <span className="text-sm font-black">{user?.name || 'Customer'}</span>
            </div>
          </div>
          <span className="text-xs font-bold underline">Call</span>
        </a>
      </div>

      {/* Items Summary */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <FiShoppingBag className="w-4 h-4 text-orange-500" />
          <span>Itemized Bill</span>
        </h3>
        <div className="divide-y divide-gray-100 text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <span className="font-bold text-gray-800">
                {item.quantity}x {item.name || item.menuItem?.name}
              </span>
              <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-3 flex items-center justify-between font-black text-base text-gray-900">
          <span>Order Amount</span>
          <span className="text-orange-600">₹{totalAmount}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        {status === 'READY_FOR_PICKUP' && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleStatusChange('OUT_FOR_DELIVERY')}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Start Delivery</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        )}

        {status === 'OUT_FOR_DELIVERY' && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => handleStatusChange('DELIVERED')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FiCheck className="w-4 h-4" />
            <span>Mark Order Delivered</span>
          </button>
        )}
      </div>
    </div>
  )
}
