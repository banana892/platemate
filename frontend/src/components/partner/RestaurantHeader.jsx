/**
 * RestaurantHeader.jsx — Partner Restaurant Header Component
 */

import { FiStar, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import RestaurantStatusToggle from './RestaurantStatusToggle.jsx'

export default function RestaurantHeader({ restaurant, onToggleOpen, loadingStatus = false }) {
  if (!restaurant) return null

  const logoUrl = restaurant.logo || restaurant.logoUrl
  const bannerUrl = restaurant.banner || restaurant.bannerUrl

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-card mb-8">
      {/* Banner */}
      <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-rose-500 relative">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Bar */}
      <div className="p-6 sm:p-8 relative pt-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 sm:-mt-14 relative z-10">
          {/* Logo & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-card border-2 border-white flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-3xl">
                  {restaurant.name?.[0]?.toUpperCase() || 'R'}
                </div>
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {restaurant.name}
                </h1>
                {restaurant.isVerified !== false && (
                  <FiCheckCircle className="text-emerald-500 text-xl" title="Verified Merchant" />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 font-semibold">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  <FiStar className="fill-current text-amber-500" />
                  <span>{restaurant.rating || restaurant.avgRating || '4.8'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <FiMapPin className="text-gray-400" />
                  <span>{restaurant.address || 'Local Outlet'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="pb-1">
            <RestaurantStatusToggle
              isOpen={restaurant.isAvailable ?? restaurant.isOpen ?? true}
              onToggle={onToggleOpen}
              loading={loadingStatus}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
