/**
 * BusinessHoursPage.jsx — Operating Schedule Page (/partner/business-hours)
 */

import { useEffect } from 'react'
import BusinessHoursEditor from '../../../components/partner/BusinessHoursEditor.jsx'

import useRestaurant from '../../../hooks/useRestaurant.js'

export default function BusinessHoursPage() {
  const { restaurant, fetchBusinessHours, updateBusinessHours, updatingRestaurant } = useRestaurant()

  useEffect(() => {
    fetchBusinessHours().catch(() => {})
  }, [fetchBusinessHours])

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Business Hours & Schedule</h2>
        <p className="text-sm text-gray-500">Configure your store opening and closing times for every day of the week</p>
      </div>

      <BusinessHoursEditor
        initialSchedule={restaurant?.businessHours}
        onSave={updateBusinessHours}
        loading={updatingRestaurant}
      />
    </div>
  )
}
