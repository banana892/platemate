/**
 * useAddresses.js — Custom Hook for Saved Address Operations
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchAddressesThunk,
  createAddressThunk,
  updateAddressThunk,
  deleteAddressThunk,
  setDefaultAddressThunk,
  setSelectedAddressId,
} from '../store/slices/addressSlice.js'

export function useAddresses() {
  const dispatch = useDispatch()
  const addressState = useSelector((state) => state.addresses || {})
  const profileState = useSelector((state) => state.profile || {})

  const addresses = (Array.isArray(addressState.addresses) && addressState.addresses.length > 0)
    ? addressState.addresses
    : (profileState.addresses || profileState.profile?.addresses || [])

  const selectedAddressId = addressState.selectedAddressId || addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || null
  const loading = addressState.loading?.fetch || false
  const actionLoading = addressState.loading?.action || false
  const error = addressState.error || null

  const fetchAddresses = useCallback(async () => {
    try {
      const result = await dispatch(fetchAddressesThunk()).unwrap()
      return result
    } catch (err) {
      toast.error(err || 'Failed to load addresses')
      throw err
    }
  }, [dispatch])

  const addAddress = async (addressData) => {
    try {
      const created = await dispatch(createAddressThunk(addressData)).unwrap()
      toast.success('Address saved successfully!')
      return created
    } catch (err) {
      toast.error(err || 'Failed to save address')
      throw err
    }
  }

  const updateAddress = async (id, addressData) => {
    try {
      const updated = await dispatch(updateAddressThunk({ id, data: addressData })).unwrap()
      toast.success('Address updated successfully!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update address')
      throw err
    }
  }

  const deleteAddress = async (id) => {
    try {
      await dispatch(deleteAddressThunk(id)).unwrap()
      toast.success('Address removed')
    } catch (err) {
      toast.error(err || 'Failed to delete address')
      throw err
    }
  }

  const setDefaultAddress = async (addressOrId) => {
    const id = typeof addressOrId === 'string' ? addressOrId : addressOrId?.id
    try {
      const updated = await dispatch(setDefaultAddressThunk(id)).unwrap()
      toast.success('Default address updated')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to set default address')
      throw err
    }
  }

  const setSelectedAddress = useCallback((id) => {
    dispatch(setSelectedAddressId(id))
  }, [dispatch])

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null

  return {
    addresses,
    selectedAddressId,
    defaultAddress,
    loading,
    actionLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    setSelectedAddress,
  }
}

export default useAddresses

