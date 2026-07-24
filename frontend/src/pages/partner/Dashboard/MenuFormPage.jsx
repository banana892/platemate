/**
 * MenuFormPage.jsx — Page for Creating & Editing Menu Items
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react'
import MenuForm from '../../../components/partner/MenuForm.jsx'
import useMenu from '../../../hooks/useMenu.js'
import useCategories from '../../../hooks/useCategories.js'

export default function MenuFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { menuItems, createMenuItem, updateMenuItem, uploadMenuItemImage } = useMenu()
  const { categories, fetchCategories } = useCategories()
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(id)
  const existingItem = isEditing ? menuItems.find((m) => m.id === id) : null

  useEffect(() => {
    fetchCategories().catch(() => {})
  }, [fetchCategories])

  const handleSubmit = async (formData, selectedFile) => {
    setLoading(true)
    try {
      let resultItem
      if (isEditing) {
        resultItem = await updateMenuItem(id, formData)
      } else {
        resultItem = await createMenuItem(formData)
      }

      // Upload image if file was selected
      if (selectedFile && resultItem?.id) {
        await uploadMenuItemImage(resultItem.id, selectedFile)
      }

      navigate('/partner/menu')
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/partner/menu')
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">
          {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditing ? 'Update dish details, pricing, or photo' : 'Add a delicious new dish to your restaurant menu'}
        </p>
      </div>

      <MenuForm
        initialValues={existingItem}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
