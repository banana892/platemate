/**
 * MenuForm.jsx — React Hook Form + Zod Form for Creating & Editing Menu Items
 */

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiCheck, FiCamera, FiDollarSign, FiClock } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const menuItemSchema = z.object({
  name: z.string().trim().min(2, 'Item name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  discountPercent: z.coerce.number().min(0).max(100).optional().default(0),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  preparationTime: z.coerce.number().min(1, 'Preparation time required').default(20),
  spiceLevel: z.string().optional().default('MEDIUM'),
  calories: z.coerce.number().optional(),
})

export default function MenuForm({
  initialValues = null,
  categories = [],
  onSubmit,
  onCancel,
  loading = false,
  _onImageUpload = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialValues?.image || initialValues?.imageUrl || null)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: initialValues || {
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      price: '',
      discountPercent: 0,
      isVeg: true,
      isAvailable: true,
      isPopular: false,
      preparationTime: 20,
      spiceLevel: 'MEDIUM',
      calories: '',
    },
  })

  const isVeg = watch('isVeg')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Allowed image formats: JPEG, PNG, WEBP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5 MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const handleFormSubmit = async (data) => {
    await onSubmit(data, selectedFile)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dish Image Upload Preview */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dish Photo</h4>
        <div className="relative group">
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-white flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Dish preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🍽️</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2.5 rounded-full shadow-glow hover:scale-110 transition-smooth cursor-pointer"
            title="Upload Photo"
          >
            <FiCamera className="text-sm" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="text-[0.7rem] text-gray-400 mt-2">JPEG, PNG or WEBP up to 5MB</span>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="name">
            Dish Name *
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Butter Chicken"
            {...register('name')}
            className={`w-full px-4 py-2.5 bg-gray-50 border ${
              errors.name ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-orange-500/20 transition-smooth`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="categoryId">
            Category *
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            className={`w-full px-4 py-2.5 bg-gray-50 border ${
              errors.categoryId ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
            } rounded-xl text-sm outline-none focus:ring-4 focus:ring-orange-500/20 transition-smooth cursor-pointer`}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Short appetizing description of ingredients, flavor profile..."
          {...register('description')}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-smooth resize-none"
        />
      </div>

      {/* Pricing & Prep Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Price */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="price">
            Price (₹) *
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
            <input
              id="price"
              type="number"
              step="0.01"
              placeholder="299"
              {...register('price')}
              className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border ${
                errors.price ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
              } rounded-xl text-sm outline-none transition-smooth`}
            />
          </div>
          {errors.price && <p className="mt-1 text-xs text-red-500 font-medium">{errors.price.message}</p>}
        </div>

        {/* Discount */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="discountPercent">
            Discount (%)
          </label>
          <input
            id="discountPercent"
            type="number"
            placeholder="0"
            {...register('discountPercent')}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-smooth"
          />
        </div>

        {/* Prep Time */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="preparationTime">
            Prep Time (mins) *
          </label>
          <div className="relative">
            <FiClock className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
            <input
              id="preparationTime"
              type="number"
              placeholder="20"
              {...register('preparationTime')}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-smooth"
            />
          </div>
        </div>
      </div>

      {/* Dietary & Options Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Veg / Non-Veg Selector */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800">Dietary Type</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValue('isVeg', true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth cursor-pointer ${
                isVeg ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Veg
            </button>
            <button
              type="button"
              onClick={() => setValue('isVeg', false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth cursor-pointer ${
                !isVeg ? 'bg-red-600 text-white shadow-xs' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <label htmlFor="isAvailable" className="text-xs font-bold text-gray-800 cursor-pointer">
            In Stock
          </label>
          <input
            id="isAvailable"
            type="checkbox"
            {...register('isAvailable')}
            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
          />
        </div>

        {/* Popular Tag */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <label htmlFor="isPopular" className="text-xs font-bold text-gray-800 cursor-pointer">
            Mark Popular 🔥
          </label>
          <input
            id="isPopular"
            type="checkbox"
            {...register('isPopular')}
            className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Optional Metadata Placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="spiceLevel">
            Spice Level
          </label>
          <select
            id="spiceLevel"
            {...register('spiceLevel')}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-orange-500"
          >
            <option value="MILD">Mild 🌿</option>
            <option value="MEDIUM">Medium 🌶️</option>
            <option value="SPICY">Spicy 🌶️🌶️</option>
            <option value="EXTRA_SPICY">Extra Spicy 🌶️🌶️🌶️</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="calories">
            Calories (kcal)
          </label>
          <input
            id="calories"
            type="number"
            placeholder="e.g. 450"
            {...register('calories')}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiCheck className="text-base" />
              <span>{initialValues ? 'Save Changes' : 'Create Menu Item'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
