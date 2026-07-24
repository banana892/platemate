/**
 * AddressForm.jsx — Address Create & Edit Form with React Hook Form + Zod
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiPhone, FiHome, FiCheck } from 'react-icons/fi'

const addressSchema = z.object({
  label: z.string().trim().min(2, 'Label must be at least 2 characters').max(30),
  recipientName: z.string().trim().min(2, 'Recipient name is required').max(100),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Please enter a valid phone number'),
  street: z.string().trim().min(5, 'Street address is required').max(255),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  postalCode: z.string().trim().min(3, 'Postal code is required').max(20),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().default(false),
})

export default function AddressForm({
  initialValues = null,
  onSubmit,
  loading = false,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues || {
      label: 'Home',
      recipientName: '',
      recipientPhone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    },
  })

  const currentLabel = watch('label')

  const quickLabels = ['Home', 'Work', 'Friends', 'Other']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Label Quick Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Address Tag</label>
        <div className="flex flex-wrap gap-2">
          {quickLabels.map((lbl) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setValue('label', lbl, { shouldValidate: true })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth cursor-pointer ${
                currentLabel === lbl
                  ? 'gradient-bg text-white shadow-glow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="recipientName">
            Recipient Name *
          </label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="recipientName"
              type="text"
              placeholder="Full Name"
              {...register('recipientName')}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${
                errors.recipientName ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
          </div>
          {errors.recipientName && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.recipientName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="recipientPhone">
            Recipient Phone *
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="recipientPhone"
              type="tel"
              placeholder="+91 9876543210"
              {...register('recipientPhone')}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${
                errors.recipientPhone ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
          </div>
          {errors.recipientPhone && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.recipientPhone.message}</p>
          )}
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="street">
          Flat / Building / Street Address *
        </label>
        <div className="relative">
          <FiHome className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
          <input
            id="street"
            type="text"
            placeholder="House no, Street name, Area"
            {...register('street')}
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${
              errors.street ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
          />
        </div>
        {errors.street && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.street.message}</p>
        )}
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="city">
            City *
          </label>
          <input
            id="city"
            type="text"
            placeholder="Mumbai"
            {...register('city')}
            className={`w-full px-4 py-2.5 bg-gray-50 border ${
              errors.city ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="state">
            State *
          </label>
          <input
            id="state"
            type="text"
            placeholder="Maharashtra"
            {...register('state')}
            className={`w-full px-4 py-2.5 bg-gray-50 border ${
              errors.state ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
          />
          {errors.state && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="postalCode">
            Postal Code *
          </label>
          <input
            id="postalCode"
            type="text"
            placeholder="400001"
            {...register('postalCode')}
            className={`w-full px-4 py-2.5 bg-gray-50 border ${
              errors.postalCode ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
          />
          {errors.postalCode && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      {/* Default Checkbox */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="isDefault"
          type="checkbox"
          {...register('isDefault')}
          className="w-4 h-4 text-[#FF4F5A] border-gray-300 rounded focus:ring-[#FF4F5A] cursor-pointer"
        />
        <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700 cursor-pointer">
          Set as Default Delivery Address
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-smooth cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="gradient-bg text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiCheck className="text-base" />
              <span>{initialValues ? 'Update Address' : 'Save Address'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
