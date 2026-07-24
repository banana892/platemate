/**
 * RestaurantSettingsPage.jsx — Business Operating Settings Page (/partner/settings)
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiDollarSign, FiClock, FiMapPin, FiSave } from 'react-icons/fi'
import useRestaurant from '../../../hooks/useRestaurant.js'

const settingsSchema = z.object({
  deliveryRadius: z.coerce.number().min(0.5, 'Minimum delivery radius is 0.5 km').max(50),
  deliveryFee: z.coerce.number().min(0, 'Delivery fee cannot be negative'),
  minOrderAmount: z.coerce.number().min(0, 'Minimum order amount cannot be negative'),
  avgPreparationTime: z.coerce.number().min(5, 'Minimum prep time is 5 minutes').max(120),
})

export default function RestaurantSettingsPage() {
  const { restaurant, updatingRestaurant, fetchRestaurant, updateSettings } = useRestaurant()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      deliveryRadius: restaurant?.deliveryRadius || 7,
      deliveryFee: restaurant?.deliveryFee || 49,
      minOrderAmount: restaurant?.minOrderAmount || 150,
      avgPreparationTime: restaurant?.avgPreparationTime || 25,
    },
  })

  useEffect(() => {
    fetchRestaurant().catch(() => {})
  }, [fetchRestaurant])

  useEffect(() => {
    if (restaurant) {
      reset({
        deliveryRadius: restaurant.deliveryRadius || 7,
        deliveryFee: restaurant.deliveryFee || 49,
        minOrderAmount: restaurant.minOrderAmount || 150,
        avgPreparationTime: restaurant.avgPreparationTime || 25,
      })
    }
  }, [restaurant, reset])

  const onSubmit = async (data) => {
    await updateSettings(data)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Business & Delivery Settings</h2>
        <p className="text-sm text-gray-500">Configure delivery radius, fee structures, minimum order limits, and prep speed</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 space-y-6">
          {/* Delivery Radius */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="deliveryRadius">
              Delivery Radius (Kilometers) *
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="deliveryRadius"
                type="number"
                step="0.5"
                {...register('deliveryRadius')}
                className={`w-full pl-10 pr-4 py-3 bg-white border ${
                  errors.deliveryRadius ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            <p className="mt-1 text-[0.7rem] text-gray-400">Maximum distance riders will deliver orders from your store.</p>
            {errors.deliveryRadius && <p className="mt-1 text-xs text-red-500 font-medium">{errors.deliveryRadius.message}</p>}
          </div>

          {/* Delivery Fee */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="deliveryFee">
              Base Delivery Fee (₹) *
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="deliveryFee"
                type="number"
                step="1"
                {...register('deliveryFee')}
                className={`w-full pl-10 pr-4 py-3 bg-white border ${
                  errors.deliveryFee ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            {errors.deliveryFee && <p className="mt-1 text-xs text-red-500 font-medium">{errors.deliveryFee.message}</p>}
          </div>

          {/* Minimum Order Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="minOrderAmount">
              Minimum Order Value (₹) *
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="minOrderAmount"
                type="number"
                step="1"
                {...register('minOrderAmount')}
                className={`w-full pl-10 pr-4 py-3 bg-white border ${
                  errors.minOrderAmount ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            {errors.minOrderAmount && <p className="mt-1 text-xs text-red-500 font-medium">{errors.minOrderAmount.message}</p>}
          </div>

          {/* Average Prep Time */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="avgPreparationTime">
              Average Kitchen Preparation Time (Minutes) *
            </label>
            <div className="relative">
              <FiClock className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="avgPreparationTime"
                type="number"
                step="1"
                {...register('avgPreparationTime')}
                className={`w-full pl-10 pr-4 py-3 bg-white border ${
                  errors.avgPreparationTime ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            {errors.avgPreparationTime && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.avgPreparationTime.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={updatingRestaurant}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updatingRestaurant ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSave className="text-base" />
                <span>Save Business Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
