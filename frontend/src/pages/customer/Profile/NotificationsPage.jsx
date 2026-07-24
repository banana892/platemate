/**
 * NotificationsPage.jsx — Customer Notifications & Preferences Page (/profile/notifications)
 */

import { useState } from 'react'
import { FiBell, FiCheckCircle, FiPackage, FiTag, FiVolume2 } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: true,
    smsAlerts: false,
    deliveryStatusSound: true,
  })

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      toast.success('Notification preferences updated')
      return next
    })
  }

  const notifications = [
    {
      id: 'notif-1',
      title: 'Order Delivered!',
      description: 'Your order #PM-20260722-1049 from Burger Bistro has been delivered.',
      time: '10 mins ago',
      icon: FiPackage,
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Special Offer Unlocked 🍕',
      description: 'Use coupon PLATEMATE50 to get 50% OFF on your next gourmet pizza order.',
      time: '2 hours ago',
      icon: FiTag,
      unread: false,
    },
    {
      id: 'notif-3',
      title: 'Email Verified',
      description: 'Your PlateMate account email address has been verified successfully.',
      time: '1 day ago',
      icon: FiCheckCircle,
      unread: false,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">Manage notification preferences and view order alerts</p>
        </div>
      </div>

      {/* Notification Preferences Toggle Grid */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 mb-8 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Preferences</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiPackage className="text-lg text-[#FF4F5A]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Order Updates</p>
                <p className="text-xs text-gray-500">Push alerts for food order status</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.orderUpdates}
              onChange={() => toggleSetting('orderUpdates')}
              className="w-4 h-4 accent-[#FF4F5A] cursor-pointer"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiTag className="text-lg text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Offers & Deals</p>
                <p className="text-xs text-gray-500">Discounts and promo codes</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.promotions}
              onChange={() => toggleSetting('promotions')}
              className="w-4 h-4 accent-[#FF4F5A] cursor-pointer"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiBell className="text-lg text-indigo-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">SMS Notifications</p>
                <p className="text-xs text-gray-500">Receive text alerts on phone</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.smsAlerts}
              onChange={() => toggleSetting('smsAlerts')}
              className="w-4 h-4 accent-[#FF4F5A] cursor-pointer"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiVolume2 className="text-lg text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Alert Sounds</p>
                <p className="text-xs text-gray-500">Play audio chime on delivery events</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.deliveryStatusSound}
              onChange={() => toggleSetting('deliveryStatusSound')}
              className="w-4 h-4 accent-[#FF4F5A] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Recent Alerts</h3>

        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = notif.icon
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-smooth flex items-start gap-4 ${
                  notif.unread
                    ? 'bg-rose-50/50 border-rose-100'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#FF4F5A] text-lg shrink-0">
                  <Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                    <span className="text-[11px] text-gray-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
