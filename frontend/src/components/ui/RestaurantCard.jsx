import { Link } from 'react-router-dom'
import { FiHeart, FiClock, FiStar } from 'react-icons/fi'
import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters.js'
import { getRatingColor } from '../../utils/helpers.js'

export default function RestaurantCard({ restaurant }) {
  const [wishlisted, setWishlisted] = useState(false)

  const {
    slug, name, image, cuisines, rating, ratingCount,
    deliveryTime, priceForTwo, offer, isVeg, isPro, isOpen, distance
  } = restaurant

  return (
    <Link
      to={`/restaurant/${slug}`}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover ${
        !isOpen ? 'opacity-60 grayscale' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Offer Badge */}
        {offer && (
          <div className="absolute bottom-3 left-3 gradient-bg text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg">
            {offer}
          </div>
        )}

        {/* Pro Badge */}
        {isPro && (
          <div className="absolute top-3 left-3 bg-[#1a1a2e] text-yellow-400 text-xs font-bold py-1 px-2.5 rounded-md flex items-center gap-1">
            ⚡ PRO
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setWishlisted(!wishlisted)
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-smooth ${
            wishlisted
              ? 'bg-[#FF4F5A] text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-[#FF4F5A]'
          }`}
        >
          <FiHeart className={`text-sm ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Closed overlay */}
        {!isOpen && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold text-sm py-1.5 px-4 rounded-full">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-[#FF4F5A] transition-smooth line-clamp-1 flex-1 mr-2">
            {name}
          </h3>
          <div className={`${getRatingColor(rating)} text-white text-xs font-bold py-0.5 px-2 rounded-md flex items-center gap-1 shrink-0`}>
            <FiStar className="text-[10px]" />
            {rating}
          </div>
        </div>

        {/* Cuisines */}
        <p className="text-sm text-gray-500 line-clamp-1 mb-3">
          {cuisines.join(', ')}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FiClock className="text-xs" />
            <span>{deliveryTime} mins</span>
          </div>
          <span>{formatCurrency(priceForTwo)} for two</span>
          <span>{distance} km</span>
        </div>

        {/* Veg indicator */}
        {isVeg && (
          <div className="mt-2 flex items-center gap-1">
            <span className="w-3.5 h-3.5 border-2 border-green-600 rounded-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            </span>
            <span className="text-xs text-green-700 font-medium">Pure Veg</span>
          </div>
        )}
      </div>
    </Link>
  )
}
