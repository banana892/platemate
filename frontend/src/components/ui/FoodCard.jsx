import { FiPlus, FiMinus, FiStar } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatters.js'

export default function FoodCard({ item, quantity = 0, onAdd, onRemove, onUpdateQuantity }) {
  const { name, description, price, image, isVeg, isBestseller, rating, ratingCount } = item

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-b-0 group">
      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Veg/Non-veg indicator */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`w-4 h-4 border-2 ${isVeg ? 'border-green-600' : 'border-red-500'} rounded-sm flex items-center justify-center`}>
            <span className={`w-2 h-2 ${isVeg ? 'bg-green-600' : 'bg-red-500'} rounded-full`} />
          </span>
          {isBestseller && (
            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
              <FiStar className="text-[10px] fill-current" /> Bestseller
            </span>
          )}
        </div>

        <h4 className="text-base font-semibold text-gray-900 mb-1">{name}</h4>
        <p className="text-base font-bold text-gray-800 mb-2">{formatCurrency(price)}</p>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar className="text-xs text-green-600 fill-green-600" />
            <span className="text-xs font-medium text-gray-600">
              {rating} ({ratingCount})
            </span>
          </div>
        )}

        <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
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
              onClick={() => onAdd?.(item)}
              className="bg-white border-2 border-[#FF4F5A] text-[#FF4F5A] font-bold text-sm py-1.5 px-6 rounded-lg shadow-md transition-smooth hover:bg-[#FF4F5A] hover:text-white hover:shadow-glow"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#FF4F5A] rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => onUpdateQuantity?.(item.id, quantity - 1)}
                className="text-white py-1.5 px-2.5 hover:bg-[#E8434D] transition-smooth"
              >
                <FiMinus className="text-sm" />
              </button>
              <span className="text-white font-bold text-sm px-2.5 min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity?.(item.id, quantity + 1)}
                className="text-white py-1.5 px-2.5 hover:bg-[#E8434D] transition-smooth"
              >
                <FiPlus className="text-sm" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
