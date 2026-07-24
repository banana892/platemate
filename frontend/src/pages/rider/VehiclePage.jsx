/**
 * VehiclePage.jsx — Vehicle Information & Verification Page (/rider/vehicle)
 */

import { useEffect, useState } from 'react'
import useRider from '../../hooks/useRider.js'
import VehicleCard from '../../components/rider/vehicle/VehicleCard.jsx'
import VehicleForm from '../../components/rider/vehicle/VehicleForm.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function VehiclePage() {
  const { profile, loading, actionLoading, loadProfile, editProfile } = useRider()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadProfile().catch(() => {})
  }, [loadProfile])

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      await editProfile(vehicleData)
      toast.success('Vehicle details updated successfully!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err || 'Failed to update vehicle details')
    }
  }

  if (loading && !profile) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton variant="card" className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vehicle Management</h1>
        <p className="text-xs text-gray-500 font-medium">View and update vehicle registration details and driving license information.</p>
      </div>

      {isEditing ? (
        <VehicleForm
          vehicle={profile}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setIsEditing(false)}
          isLoading={actionLoading}
        />
      ) : (
        <VehicleCard vehicle={profile} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  )
}
