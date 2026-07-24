/**
 * ProfileCard.jsx — Quick Stats & Action Shortcuts Component
 */

import { Link } from 'react-router-dom'
import {
  FiShoppingBag,
  FiMapPin,
  FiAward,
  FiEdit3,
  FiLock,
  FiArrowRight,
} from 'react-icons/fi'

export default function ProfileCard({ user, totalOrders = 0, totalAddresses = 0 }) {
  const loyaltyPoints = user?.loyaltyPoints || Math.max(totalOrders * 120, 350) // Placeholder loyalty system

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: FiShoppingBag,
      color: 'bg-rose-50 text-[#FF4F5A]',
      href: '/profile/orders',
    },
    {
      label: 'Saved Addresses',
      value: totalAddresses,
      icon: FiMapPin,
      color: 'bg-amber-50 text-amber-600',
      href: '/profile/addresses',
    },
    {
      label: 'Loyalty Points',
      value: `${loyaltyPoints} pts`,
      icon: FiAward,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/profile',
    },
  ]

  const actions = [
    { label: 'Edit Profile', href: '/profile/edit', icon: FiEdit3 },
    { label: 'Manage Addresses', href: '/profile/addresses', icon: FiMapPin },
    { label: 'Order History', href: '/profile/orders', icon: FiShoppingBag },
    { label: 'Change Password', href: '/profile/change-password', icon: FiLock },
  ]

  return (
    <div className="space-y-8">
      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link
              key={idx}
              to={stat.href}
              className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:shadow-card hover:border-gray-200 transition-smooth group flex items-center gap-4 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
                <Icon />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 group-hover:text-[#FF4F5A] transition-smooth">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions List */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Link
                key={idx}
                to={action.href}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#FF4F5A] hover:bg-rose-50/40 transition-smooth group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-gray-400 group-hover:text-[#FF4F5A] transition-smooth text-lg" />
                  <span className="font-semibold text-sm text-gray-700 group-hover:text-gray-900">
                    {action.label}
                  </span>
                </div>
                <FiArrowRight className="text-gray-300 group-hover:text-[#FF4F5A] group-hover:translate-x-1 transition-smooth text-sm" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
