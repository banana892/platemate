/**
 * RestaurantProfilePage.jsx — Restaurant Profile & Branding Page (/partner/profile)
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiHome, FiPhone, FiMail, FiMapPin, FiSave, FiCheckCircle } from 'react-icons/fi'
import RestaurantLogoUpload from '../../../components/partner/RestaurantLogoUpload.jsx'
import RestaurantBannerUpload from '../../../components/partner/RestaurantBannerUpload.jsx'
import useRestaurant from '../../../hooks/useRestaurant.js'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Restaurant name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional(),
  cuisine: z.string().trim().min(2, 'Cuisine is required'),
  phone: z.string().trim().min(6, 'Valid phone number required'),
  email: z.string().trim().email('Valid email required'),
  address: z.string().trim().min(5, 'Address is required'),
})

export default function RestaurantProfilePage() {
  const {
    restaurant,
    updatingRestaurant,
    uploadingImage,
    uploadProgress,
    fetchRestaurant,
    updateProfile,
    uploadLogo,
    uploadBanner,
  } = useRestaurant()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: restaurant?.name || '',
      description: restaurant?.description || '',
      cuisine: restaurant?.cuisine || '',
      phone: restaurant?.phone || '',
      email: restaurant?.email || '',
      address: restaurant?.address || '',
    },
  })

  useEffect(() => {
    fetchRestaurant().catch(() => {})
  }, [fetchRestaurant])

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine: restaurant.cuisine || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        address: restaurant.address || '',
      })
    }
  }, [restaurant, reset])

  const onSubmit = async (data) => {
    await updateProfile(data)
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Restaurant Profile</h2>
          <p className="text-sm text-gray-500">Manage basic restaurant details and brand imagery</p>
        </div>

        {restaurant?.isVerified !== false && (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-500" /> Verified Merchant
          </span>
        )}
      </div>

      {/* Brand Imagery Section */}
      <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 space-y-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branding & Media Assets</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Logo Uploader */}
          <div className="md:col-span-1 border-r border-gray-200/60 pr-4">
            <p className="text-xs font-bold text-gray-700 text-center mb-3">Restaurant Logo</p>
            <RestaurantLogoUpload
              currentLogoUrl={restaurant?.logo || restaurant?.logoUrl}
              onUpload={uploadLogo}
              loading={uploadingImage}
              progress={uploadProgress}
            />
          </div>

          {/* Banner Uploader */}
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-gray-700 mb-3">Store Cover Banner</p>
            <RestaurantBannerUpload
              currentBannerUrl={restaurant?.banner || restaurant?.bannerUrl}
              onUpload={uploadBanner}
              loading={uploadingImage}
              progress={uploadProgress}
            />
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name & Cuisine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="name">
              Restaurant Name *
            </label>
            <div className="relative">
              <FiHome className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                  errors.name ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="cuisine">
              Cuisine Specialty *
            </label>
            <input
              id="cuisine"
              type="text"
              placeholder="e.g. North Indian, Biryani, Mughlai"
              {...register('cuisine')}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.cuisine ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
              } rounded-xl text-sm outline-none transition-smooth`}
            />
            {errors.cuisine && <p className="mt-1 text-xs text-red-500 font-medium">{errors.cuisine.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="description">
            Short Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Tell food lovers about your signature dishes and story..."
            {...register('description')}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-smooth resize-none"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="phone">
              Contact Phone *
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
              Contact Email *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                  errors.email ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                } rounded-xl text-sm outline-none transition-smooth`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="address">
            Physical Outlet Address *
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="address"
              type="text"
              {...register('address')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                errors.address ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
              } rounded-xl text-sm outline-none transition-smooth`}
            />
          </div>
          {errors.address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.address.message}</p>}
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
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
