/**
 * CategoryCard.jsx — Category Display Card
 */

import { FiEdit2, FiTrash2, FiLayers } from 'react-icons/fi'

export default function CategoryCard({ category, onEdit, onDelete, loading = false }) {
  if (!category) return null

  const itemCount = category.menuItems?.length || category._count?.menuItems || 0

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-card transition-smooth flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
          <FiLayers />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">{category.name}</h3>
          <p className="text-xs text-gray-400 font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in category
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(category)}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-smooth cursor-pointer"
          title="Edit Category"
        >
          <FiEdit2 className="text-sm" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth cursor-pointer"
          title="Delete Category"
        >
          <FiTrash2 className="text-sm" />
        </button>
      </div>
    </div>
  )
}
