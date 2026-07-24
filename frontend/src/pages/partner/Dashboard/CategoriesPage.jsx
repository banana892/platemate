/**
 * CategoriesPage.jsx — Partner Category Management Page (/partner/categories)
 */

import { useEffect, useState } from 'react'
import { FiPlus, FiLayers } from 'react-icons/fi'
import CategoryCard from '../../../components/partner/CategoryCard.jsx'
import CategoryForm from '../../../components/partner/CategoryForm.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useCategories from '../../../hooks/useCategories.js'

export default function CategoriesPage() {
  const { categories, loading, actionLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)

  useEffect(() => {
    fetchCategories().catch(() => {})
  }, [fetchCategories])

  const handleCreateOrUpdate = async (formData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData)
      setEditingCategory(null)
    } else {
      await createCategory(formData)
      setShowForm(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    try {
      await deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Menu Categories</h2>
          <p className="text-sm text-gray-500">Organize your menu into structured sections for customers</p>
        </div>

        {!showForm && !editingCategory && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <FiPlus className="text-base" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Form Dialog Box */}
      {(showForm || editingCategory) && (
        <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200 animate-fade-in">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          <CategoryForm
            initialValues={editingCategory}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setShowForm(false)
              setEditingCategory(null)
            }}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-24" count={4} />
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && !showForm && (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center text-3xl mb-4">
            <FiLayers />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Categories Created</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Create categories like "Starters", "Main Course", or "Beverages" to group your dishes.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth cursor-pointer"
          >
            <FiPlus />
            <span>Add First Category</span>
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={(cat) => setEditingCategory(cat)}
              onDelete={(cat) => setDeletingCategory(cat)}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCategory)}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? Category deletion will fail if menu items are currently assigned to it.`}
        confirmText="Delete Category"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingCategory(null)}
      />
    </div>
  )
}
