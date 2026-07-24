/**
 * CategoryFormPage.jsx — Page Wrapper for Category Creation & Editing
 */

import { useParams, useNavigate } from 'react-router-dom'
import CategoryForm from '../../../components/partner/CategoryForm.jsx'
import useCategories from '../../../hooks/useCategories.js'

export default function CategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { categories, actionLoading, createCategory, updateCategory } = useCategories()

  const isEditing = Boolean(id)
  const existingCategory = isEditing ? categories.find((c) => c.id === id) : null

  const handleSubmit = async (formData) => {
    if (isEditing) {
      await updateCategory(id, formData)
    } else {
      await createCategory(formData)
    }
    navigate('/partner/categories')
  }

  const handleCancel = () => {
    navigate('/partner/categories')
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditing ? 'Update category name or order index' : 'Create a new menu category for grouping items'}
        </p>
      </div>

      <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-200">
        <CategoryForm
          initialValues={existingCategory}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={actionLoading}
        />
      </div>
    </div>
  )
}
