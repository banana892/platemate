/**
 * VehicleForm.jsx — Rider Vehicle Management Form (Phase F3)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiTruck, FiFileText, FiSave, FiAlertCircle } from 'react-icons/fi'

const vehicleSchema = z.object({
  vehicleType: z.string().min(2, 'Vehicle type must be at least 2 characters'),
  vehicleNumber: z.string().min(2, 'Vehicle number must be at least 2 characters'),
  licenseNumber: z.string().min(4, 'License number must be at least 4 characters'),
})

export default function VehicleForm({ vehicle = null, onSubmit, onCancel, isLoading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: vehicle?.vehicleType || 'Motorcycle',
      vehicleNumber: vehicle?.vehicleNumber || '',
      licenseNumber: vehicle?.licenseNumber || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
      <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">Edit Vehicle Details</h3>

      <div className="space-y-4">
        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
            Vehicle Type
          </label>
          <div className="relative">
            <FiTruck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              {...register('vehicleType')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
              placeholder="e.g. Electric Scooter, Motorcycle"
            />
          </div>
          {errors.vehicleType && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>{errors.vehicleType.message}</span>
            </p>
          )}
        </div>

        {/* Vehicle Number */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
            Vehicle Registration Number
          </label>
          <div className="relative">
            <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              {...register('vehicleNumber')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none uppercase"
              placeholder="e.g. KA-01-AB-1234"
            />
          </div>
          {errors.vehicleNumber && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>{errors.vehicleNumber.message}</span>
            </p>
          )}
        </div>

        {/* License Number */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
            Driving License Number
          </label>
          <div className="relative">
            <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              {...register('licenseNumber')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none uppercase"
              placeholder="e.g. DL-1420110012345"
            />
          </div>
          {errors.licenseNumber && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>{errors.licenseNumber.message}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  )
}
