/**
 * useRestaurant.js — Custom Hook for Partner Restaurant Profile, Settings & Hours
 */

import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchPartnerDashboardThunk,
  fetchPartnerRestaurantThunk,
  updatePartnerProfileThunk,
  updatePartnerSettingsThunk,
  fetchBusinessHoursThunk,
  updateBusinessHoursThunk,
  toggleRestaurantOpenThunk,
  setRestaurant,
} from '../store/slices/partnerSlice.js'
import partnerService from '../services/partner.service.js'

export function useRestaurant() {
  const dispatch = useDispatch()
  const { restaurant, dashboard, loading, error } = useSelector((state) => state.partner)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await dispatch(fetchPartnerDashboardThunk()).unwrap()
      return data
    } catch (err) {
      toast.error(err || 'Failed to fetch dashboard')
      throw err
    }
  }, [dispatch])

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await dispatch(fetchPartnerRestaurantThunk()).unwrap()
      return data
    } catch (err) {
      toast.error(err || 'Failed to fetch restaurant profile')
      throw err
    }
  }, [dispatch])

  const updateProfile = async (profileData) => {
    try {
      const updated = await dispatch(updatePartnerProfileThunk(profileData)).unwrap()
      toast.success('Restaurant profile updated!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update restaurant profile')
      throw err
    }
  }

  const updateSettings = async (settingsData) => {
    try {
      const updated = await dispatch(updatePartnerSettingsThunk(settingsData)).unwrap()
      toast.success('Restaurant settings saved!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update settings')
      throw err
    }
  }

  const fetchBusinessHours = useCallback(async () => {
    try {
      const hours = await dispatch(fetchBusinessHoursThunk()).unwrap()
      return hours
    } catch (err) {
      toast.error(err || 'Failed to fetch business hours')
      throw err
    }
  }, [dispatch])

  const updateBusinessHours = async (hoursData) => {
    try {
      const updated = await dispatch(updateBusinessHoursThunk(hoursData)).unwrap()
      toast.success('Business hours schedule saved!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update business hours')
      throw err
    }
  }

  const toggleRestaurantOpen = async (isOpen, reason = '') => {
    try {
      await dispatch(toggleRestaurantOpenThunk({ isOpen, reason })).unwrap()
      toast.success(`Restaurant is now ${isOpen ? 'OPEN' : 'CLOSED'}`)
    } catch (err) {
      toast.error(err || 'Failed to toggle restaurant status')
      throw err
    }
  }

  const uploadLogo = async (file) => {
    setUploadingImage(true)
    setUploadProgress(0)
    try {
      const result = await partnerService.uploadLogo(file, (percent) => setUploadProgress(percent))
      dispatch(setRestaurant({ logo: result.url || result.logo }))
      toast.success('Restaurant logo updated!')
      return result
    } catch (err) {
      toast.error(err.message || 'Logo upload failed')
      throw err
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }

  const uploadBanner = async (file) => {
    setUploadingImage(true)
    setUploadProgress(0)
    try {
      const result = await partnerService.uploadBanner(file, (percent) => setUploadProgress(percent))
      dispatch(setRestaurant({ banner: result.url || result.banner }))
      toast.success('Restaurant banner updated!')
      return result
    } catch (err) {
      toast.error(err.message || 'Banner upload failed')
      throw err
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }

  return {
    restaurant,
    dashboard,
    loadingDashboard: loading.dashboard,
    loadingRestaurant: loading.restaurant,
    updatingRestaurant: loading.updateRestaurant,
    uploadingImage,
    uploadProgress,
    error: error.restaurant,
    fetchDashboard,
    fetchRestaurant,
    updateProfile,
    updateSettings,
    fetchBusinessHours,
    updateBusinessHours,
    toggleRestaurantOpen,
    uploadLogo,
    uploadBanner,
  }
}

export default useRestaurant
