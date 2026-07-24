import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiUser,
  FiMapPin,
  FiShoppingBag,
  FiHeart,
  FiBell,
  FiLock,
  FiSliders,
  FiEdit3,
  FiLogOut,
  FiAlertTriangle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import useAuth from '../../hooks/useAuth.js'
import { executeLogout } from '../../utils/authUtils.js'
import DeleteAccountModal from './DeleteAccountModal.jsx'

export default function SettingsNavigation({ orderCount = 0, addressCount = 0 }) {
  const { user, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = async () => {
    await executeLogout(logout, navigate)
  }

  const handleDeleteConfirm = async ({ confirmation, password }) => {
    setIsDeleting(true)
    try {
      await deleteAccount({ confirmation, password })
      setIsDeleteModalOpen(false)
      toast.success('Account deleted successfully.')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete account'
      toast.error(msg)
      throw err
    } finally {
      setIsDeleting(false)
    }
  }

  const navItems = [
    { label: 'Overview', href: '/profile', icon: FiUser, end: true },
    { label: 'Edit Profile', href: '/profile/edit', icon: FiEdit3 },
    {
      label: 'My Addresses',
      href: '/profile/addresses',
      icon: FiMapPin,
      badge: addressCount > 0 ? addressCount : null,
    },
    {
      label: 'Order History',
      href: '/profile/orders',
      icon: FiShoppingBag,
      badge: orderCount > 0 ? orderCount : null,
    },
    { label: 'Favorites', href: '/profile/favorites', icon: FiHeart },
    { label: 'Notifications', href: '/profile/notifications', icon: FiBell },
    { label: 'Change Password', href: '/profile/change-password', icon: FiLock },
    { label: 'Preferences', href: '/profile/preferences', icon: FiSliders },
  ]

  return (
    <>
      <nav className="bg-white rounded-3xl p-4 shadow-card border border-gray-100 sticky top-24">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-4 pt-2 pb-3">
          Account Settings
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-smooth cursor-pointer ${
                    isActive
                      ? 'gradient-bg text-white shadow-glow'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-lg flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/20 text-current border border-current/10">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm text-red-600 hover:bg-rose-50 border-t border-gray-100 transition-smooth cursor-pointer mt-3"
          >
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="text-lg flex-shrink-0 text-red-500" />
              <span>⚠ Delete Account</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-smooth cursor-pointer mt-1"
          >
            <div className="flex items-center gap-3">
              <FiLogOut className="text-lg flex-shrink-0 text-gray-500" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </nav>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userEmail={user?.email || ''}
        isLoading={isDeleting}
      />
    </>
  )
}
