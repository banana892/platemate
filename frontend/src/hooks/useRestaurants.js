/**
 * useRestaurants.js — Custom Hook for Admin Restaurant Moderation & Approvals (Phase F4)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import restaurantAdminService from '../services/restaurant-admin.service.js'
import {
  fetchAdminRestaurantsThunk,
  setSelectedRestaurant,
} from '../store/slices/adminSlice.js'

export function useRestaurants() {
  const dispatch = useDispatch()
  const { restaurants, selectedRestaurant, loading } = useSelector((state) => state.admin)

  const fetchRestaurants = useCallback(async (params = {}) => {
    try {
      return await dispatch(fetchAdminRestaurantsThunk(params)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to load restaurants')
    }
  }, [dispatch])

  const approveRestaurant = async (id) => {
    try {
      await restaurantAdminService.approveRestaurant(id)
      toast.success('Restaurant approved successfully')
      fetchRestaurants()
    } catch (err) {
      toast.error(err.message || 'Failed to approve restaurant')
    }
  }

  const rejectRestaurant = async (id, reason) => {
    try {
      await restaurantAdminService.rejectRestaurant(id, reason)
      toast.success('Restaurant rejected')
      fetchRestaurants()
    } catch (err) {
      toast.error(err.message || 'Failed to reject restaurant')
    }
  }

  const suspendRestaurant = async (id, reason) => {
    try {
      await restaurantAdminService.suspendRestaurant(id, reason)
      toast.success('Restaurant suspended')
      fetchRestaurants()
    } catch (err) {
      toast.error(err.message || 'Failed to suspend restaurant')
    }
  }

  const activateRestaurant = async (id) => {
    try {
      await restaurantAdminService.activateRestaurant(id)
      toast.success('Restaurant activated')
      fetchRestaurants()
    } catch (err) {
      toast.error(err.message || 'Failed to activate restaurant')
    }
  }

  const selectRestaurant = (restaurant) => {
    dispatch(setSelectedRestaurant(restaurant))
  }

  return {
    restaurants,
    selectedRestaurant,
    loading: loading.restaurants,
    fetchRestaurants,
    approveRestaurant,
    rejectRestaurant,
    suspendRestaurant,
    activateRestaurant,
    selectRestaurant,
  }
}

export default useRestaurants
