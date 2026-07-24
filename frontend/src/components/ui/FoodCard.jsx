import React from 'react'
import { FiPlus, FiMinus, FiStar } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatters.js'

export const FoodCard = React.memo(function FoodCard({ item, quantity = 0, onAdd, _onRemove, onUpdateQuantity }) {
  const { name, description, price, image, isVeg, isBestseller, rating, ratingCount } = item

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 dark:border-slate-800 last:border-b-0 group">
      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Veg/Non-veg indicator */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            className={`w-4 h-4 border-2 ${isVeg ? 'border-green-600' : 'border-red-500'} rounded-sm flex items-center justify-center`}
          >
            <span className={`w-2 h-2 ${isVeg ? 'bg-green-600' : 'bg-red-500'} rounded-full`} />
          </span>
          {isBestseller && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <FiStar className="text-[10px] fill-current" aria-hidden="true" /> Bestseller
            </span>
          )}
        </div>

        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{name}</h4>
        <p className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">{formatCurrency(price)}</p>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar className="text-xs text-green-600 fill-green-600" aria-hidden="true" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {rating} ({ratingCount})
            </span>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
      </div>

      {/* Image + Add button */}
      <div className="relative shrink-0 w-28 sm:w-32">
        {image && (
          <img
            src={image}
            alt={name}
            className="w-full h-24 sm:h-28 rounded-xl object-cover"
            loading="lazy"
          />
        )}

        {/* Add / Quantity control */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => onAdd?.(item)}
              className="bg-white dark:bg-slate-900 border-2 border-[#FF4F5A] text-[#FF4F5A] font-bold text-sm py-1.5 px-6 rounded-lg shadow-md transition-smooth hover:bg-[#FF4F5A] hover:text-white focus-ring"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#FF4F5A] rounded-lg shadow-md overflow-hidden">
              <button
                type="button"
                aria-label={`Decrease quantity of ${name}`}
                onClick={() => onUpdateQuantity?.(item.id, quantity - 1)}
                className="text-white py-1.5 px-2.5 hover:bg-[#E8434D] transition-smooth focus-ring"
              >
                <FiMinus className="text-sm" />
              </button>
              <span className="text-white font-bold text-sm px-2.5 min-w-[28px] text-center" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${name}`}
                onClick={() => onUpdateQuantity?.(item.id, quantity + 1)}
                className="text-white py-1.5 px-2.5 hover:bg-[#E8434D] transition-smooth focus-ring"
              >
                <FiPlus className="text-sm" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default FoodCard
