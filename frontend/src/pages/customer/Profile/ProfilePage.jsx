/**
 * ProfilePage.jsx — Customer Profile Overview Dashboard (/profile)
 */

import { useEffect } from 'react'
import ProfileHeader from '../../../components/customer/ProfileHeader.jsx'
import ProfileCard from '../../../components/customer/ProfileCard.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useProfile from '../../../hooks/useProfile.js'
import useAddresses from '../../../hooks/useAddresses.js'
import useOrders from '../../../hooks/useOrders.js'

export default function ProfilePage() {
  const { user, loading: profileLoading, fetchProfile } = useProfile()
  const { addresses, fetchAddresses } = useAddresses()
  const { orders, fetchOrders } = useOrders()

  useEffect(() => {
    fetchProfile().catch(() => {})
    fetchAddresses().catch(() => {})
    fetchOrders().catch(() => {})
  }, [fetchProfile, fetchAddresses, fetchOrders])

  if (profileLoading && !user) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-44" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="card" className="h-28" count={3} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">My Account</h2>
          <p className="text-sm text-gray-500">Manage your profile, saved addresses, and order history</p>
        </div>
      </div>

      <ProfileHeader user={user} />

      <ProfileCard
        user={user}
        totalOrders={orders?.length || 0}
        totalAddresses={addresses?.length || 0}
      />
    </div>
  )
}
