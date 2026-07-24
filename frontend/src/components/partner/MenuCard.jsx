/**
 * MenuCard.jsx — Grid Card for Menu Item Display
 */

import { FiEdit2, FiTrash2, FiTag, FiStar } from 'react-icons/fi'

export default function MenuCard({ item, onEdit, onDelete, onToggleAvailability, loading = false }) {
  if (!item) return null

  const isVeg = item.isVeg ?? item.isVegetarian ?? true
  const imageUrl = item.image || item.imageUrl

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-card transition-smooth overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Thumbnail & Badges */}
        <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black">
              🍽️
            </div>
          )}

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg shadow-xs flex items-center gap-1.5 text-[0.7rem] font-bold">
            <span
              className={`w-2.5 h-2.5 rounded-full border ${
                isVeg ? 'bg-emerald-500 border-emerald-700' : 'bg-red-500 border-red-700'
              }`}
            />
            <span className={isVeg ? 'text-emerald-700' : 'text-red-700'}>
              {isVeg ? 'VEG' : 'NON-VEG'}
            </span>
          </div>

          {/* Popular / Featured Badge */}
          {item.isPopular && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[0.68rem] font-extrabold flex items-center gap-1 shadow-xs">
              <FiStar className="fill-current text-[0.65rem]" />
              <span>POPULAR</span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.name}</h3>
            <span className="font-extrabold text-base text-gray-900 flex-shrink-0">
              ₹{item.price}
            </span>
          </div>

          {item.category && (
            <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md mb-2">
              <FiTag className="text-[0.65rem]" />
              <span>{item.category.name || item.category}</span>
            </span>
          )}

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {item.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-2">
        {/* Availability Switch */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={item.isAvailable ?? true}
            onChange={(e) => onToggleAvailability(item.id, e.target.checked)}
            disabled={loading}
            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
          />
          <span className={`text-xs font-bold ${item.isAvailable ?? true ? 'text-emerald-700' : 'text-gray-400'}`}>
            {item.isAvailable ?? true ? 'In Stock' : 'Out of Stock'}
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-smooth cursor-pointer"
            title="Edit item"
          >
            <FiEdit2 className="text-sm" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth cursor-pointer"
            title="Delete item"
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  )
}
