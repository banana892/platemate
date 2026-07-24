/**
 * CategoryForm.jsx — Category Create & Edit Form
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiCheck, FiLayers } from 'react-icons/fi'

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50),
  sortOrder: z.coerce.number().optional().default(0),
  description: z.string().trim().max(255).optional(),
})

export default function CategoryForm({ initialValues = null, onSubmit, onCancel, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues || {
      name: '',
      sortOrder: 0,
      description: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="name">
          Category Name *
        </label>
        <div className="relative">
          <FiLayers className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
          <input
            id="name"
            type="text"
            placeholder="e.g. Starters, Main Course, Drinks"
            {...register('name')}
            className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${
              errors.name ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-orange-500/20 transition-smooth`}
          />
        </div>
        {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="sortOrder">
          Sort Order Index
        </label>
        <input
          id="sortOrder"
          type="number"
          placeholder="0"
          {...register('sortOrder')}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-xl font-bold text-xs hover:shadow-glow transition-smooth flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiCheck />
              <span>{initialValues ? 'Save Category' : 'Add Category'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
