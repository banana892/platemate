/**
 * useCategories.js — Custom Hook for Partner Menu Categories
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchPartnerCategoriesThunk,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
} from '../store/slices/partnerSlice.js'

export function useCategories() {
  const dispatch = useDispatch()
  const { categories, loading, error } = useSelector((state) => state.partner)

  const fetchCategories = useCallback(async () => {
    try {
      const result = await dispatch(fetchPartnerCategoriesThunk()).unwrap()
      return result
    } catch (err) {
      toast.error(err || 'Failed to fetch categories')
      throw err
    }
  }, [dispatch])

  const createCategory = async (categoryData) => {
    try {
      const created = await dispatch(createCategoryThunk(categoryData)).unwrap()
      toast.success('Category created successfully!')
      return created
    } catch (err) {
      toast.error(err || 'Failed to create category')
      throw err
    }
  }

  const updateCategory = async (id, categoryData) => {
    try {
      const updated = await dispatch(updateCategoryThunk({ id, data: categoryData })).unwrap()
      toast.success('Category updated successfully!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update category')
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      await dispatch(deleteCategoryThunk(id)).unwrap()
      toast.success('Category deleted')
    } catch (err) {
      toast.error(err || 'Cannot delete category containing menu items')
      throw err
    }
  }

  return {
    categories,
    loading: loading.categories,
    actionLoading: loading.categoryAction,
    error: error.categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

export default useCategories
