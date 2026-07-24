/**
 * ProfilePage.jsx — Rider Profile Management Page (/rider/profile)
 */

import { useEffect } from 'react'
import useRider from '../../hooks/useRider.js'
import ProfileForm from '../../components/rider/profile/ProfileForm.jsx'
import VehicleCard from '../../components/rider/vehicle/VehicleCard.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiStar, FiShield } from 'react-icons/fi'

export default function ProfilePage() {
  const { profile, loading, actionLoading, loadProfile, editProfile } = useRider()

  useEffect(() => {
    loadProfile().catch(() => {})
  }, [loadProfile])

  const handleUpdateProfile = async (formData) => {
    try {
      await editProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err || 'Failed to update profile')
    }
  }

  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rider Profile</h1>
        <p className="text-xs text-gray-500 font-medium">Manage your personal information, phone, avatar, and emergency contacts.</p>
      </div>

      {/* Summary Profile Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
            alt={profile?.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-gray-900">{profile?.name || 'Rider Partner'}</h2>
              {profile?.isApproved && (
                <span className="bg-emerald-50 text-emerald-700 text-[0.65rem] font-black px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <FiCheckCircle className="w-3 h-3" /> Approved
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 font-semibold">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <FiStar className="w-3.5 h-3.5 fill-amber-400" /> {profile?.averageRating || 4.8}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiShield className="w-3.5 h-3.5" /> ID Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <ProfileForm profile={profile} onSubmit={handleUpdateProfile} isLoading={actionLoading} />

      {/* Vehicle Summary */}
      <VehicleCard vehicle={profile} />
    </div>
  )
}
