/**
 * MenuTable.jsx — Table View for Menu Items
 */

import { FiEdit2, FiTrash2, FiStar } from 'react-icons/fi'

export default function MenuTable({ items, onEdit, onDelete, onToggleAvailability, loading = false }) {
  if (!items || items.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="py-3.5 px-6">Item</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">In Stock</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {items.map((item) => {
              const isVeg = item.isVeg ?? item.isVegetarian ?? true
              const imageUrl = item.image || item.imageUrl

              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-smooth">
                  {/* Name & Thumb */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900">{item.name}</span>
                          {item.isPopular && (
                            <span className="bg-amber-100 text-amber-800 text-[0.65rem] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <FiStar className="fill-current text-[0.6rem]" /> Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{item.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 text-xs font-semibold text-gray-600">
                    {item.category?.name || item.category || 'Uncategorized'}
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 font-bold text-gray-900">₹{item.price}</td>

                  {/* Type */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[0.7rem] font-bold px-2 py-0.5 rounded-full border ${
                        isVeg
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      {isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </td>

                  {/* In Stock Toggle */}
                  <td className="py-4 px-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isAvailable ?? true}
                        onChange={(e) => onToggleAvailability(item.id, e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                      />
                      <span className={`text-xs font-bold ${item.isAvailable ?? true ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {item.isAvailable ?? true ? 'In Stock' : 'Out'}
                      </span>
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-smooth cursor-pointer"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth cursor-pointer"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
