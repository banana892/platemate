/**
 * useMenu.js — Custom Hook for Partner Menu Item Operations
 */

import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchPartnerMenuItemsThunk,
  createMenuItemThunk,
  updateMenuItemThunk,
  deleteMenuItemThunk,
  toggleMenuItemAvailabilityThunk,
} from '../store/slices/partnerSlice.js'
import menuService from '../services/menu.service.js'

export function useMenu() {
  const dispatch = useDispatch()
  const { menuItems, loading, error } = useSelector((state) => state.partner)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchMenuItems = useCallback(
    async (params = {}) => {
      try {
        const result = await dispatch(fetchPartnerMenuItemsThunk(params)).unwrap()
        return result
      } catch (err) {
        toast.error(err || 'Failed to fetch menu items')
        throw err
      }
    },
    [dispatch]
  )

  const createMenuItem = async (itemData) => {
    try {
      const created = await dispatch(createMenuItemThunk(itemData)).unwrap()
      toast.success('Menu item created successfully!')
      return created
    } catch (err) {
      toast.error(err || 'Failed to create menu item')
      throw err
    }
  }

  const updateMenuItem = async (id, itemData) => {
    try {
      const updated = await dispatch(updateMenuItemThunk({ id, data: itemData })).unwrap()
      toast.success('Menu item updated successfully!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update menu item')
      throw err
    }
  }

  const deleteMenuItem = async (id) => {
    try {
      await dispatch(deleteMenuItemThunk(id)).unwrap()
      toast.success('Menu item deleted')
    } catch (err) {
      toast.error(err || 'Failed to delete menu item')
      throw err
    }
  }

  const toggleAvailability = async (id, isAvailable) => {
    try {
      await dispatch(toggleMenuItemAvailabilityThunk({ id, isAvailable })).unwrap()
      toast.success(`Item marked as ${isAvailable ? 'In Stock' : 'Out of Stock'}`)
    } catch (err) {
      toast.error(err || 'Failed to update availability')
      throw err
    }
  }

  const uploadMenuItemImage = async (id, file) => {
    setUploadingImage(true)
    setUploadProgress(0)
    try {
      const result = await menuService.uploadMenuItemImage(id, file, (percent) =>
        setUploadProgress(percent)
      )
      toast.success('Dish image updated!')
      return result
    } catch (err) {
      toast.error(err.message || 'Dish image upload failed')
      throw err
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }

  return {
    menuItems,
    loading: loading.menu,
    actionLoading: loading.menuAction,
    uploadingImage,
    uploadProgress,
    error: error.menu,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    uploadMenuItemImage,
  }
}

export default useMenu
