/**
 * addressSlice.js — Redux Slice for Delivery Address Management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import addressService from '../../services/address.service.js'

export const fetchAddressesThunk = createAsyncThunk(
  'addresses/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const data = await addressService.getAddresses()
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch addresses')
    }
  }
)

export const createAddressThunk = createAsyncThunk(
  'addresses/createAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const data = await addressService.createAddress(addressData)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create address')
    }
  }
)

export const updateAddressThunk = createAsyncThunk(
  'addresses/updateAddress',
  async ({ id, data: addressData }, { rejectWithValue }) => {
    try {
      const data = await addressService.updateAddress(id, addressData)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update address')
    }
  }
)

export const deleteAddressThunk = createAsyncThunk(
  'addresses/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete address')
    }
  }
)

export const setDefaultAddressThunk = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (id, { rejectWithValue }) => {
    try {
      const data = await addressService.setDefaultAddress(id)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to set default address')
    }
  }
)

const initialState = {
  addresses: [],
  selectedAddressId: null,
  loading: {
    fetch: false,
    action: false,
  },
  error: null,
}

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    setSelectedAddressId: (state, action) => {
      state.selectedAddressId = action.payload
    },
    clearAddressError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAddressesThunk
      .addCase(fetchAddressesThunk.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchAddressesThunk.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.addresses = action.payload
        if (!state.selectedAddressId && action.payload.length > 0) {
          const defaultAddr = action.payload.find((a) => a.isDefault) || action.payload[0]
          state.selectedAddressId = defaultAddr.id
        }
      })
      .addCase(fetchAddressesThunk.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload
      })

      // createAddressThunk
      .addCase(createAddressThunk.pending, (state) => {
        state.loading.action = true
        state.error = null
      })
      .addCase(createAddressThunk.fulfilled, (state, action) => {
        state.loading.action = false
        const created = action.payload
        // If set to default, set existing addresses' isDefault to false
        if (created.isDefault) {
          state.addresses.forEach((a) => {
            a.isDefault = false
          })
        }
        state.addresses.unshift(created)
        state.selectedAddressId = created.id
      })
      .addCase(createAddressThunk.rejected, (state, action) => {
        state.loading.action = false
        state.error = action.payload
      })

      // updateAddressThunk
      .addCase(updateAddressThunk.pending, (state) => {
        state.loading.action = true
        state.error = null
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.loading.action = false
        const updated = action.payload
        if (updated.isDefault) {
          state.addresses.forEach((a) => {
            a.isDefault = false
          })
        }
        const index = state.addresses.findIndex((a) => a.id === updated.id)
        if (index !== -1) {
          state.addresses[index] = updated
        }
      })
      .addCase(updateAddressThunk.rejected, (state, action) => {
        state.loading.action = false
        state.error = action.payload
      })

      // deleteAddressThunk
      .addCase(deleteAddressThunk.pending, (state) => {
        state.loading.action = true
        state.error = null
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.loading.action = false
        const deletedId = action.payload
        state.addresses = state.addresses.filter((a) => a.id !== deletedId)
        if (state.selectedAddressId === deletedId) {
          const remainingDefault = state.addresses.find((a) => a.isDefault) || state.addresses[0]
          state.selectedAddressId = remainingDefault ? remainingDefault.id : null
        }
      })
      .addCase(deleteAddressThunk.rejected, (state, action) => {
        state.loading.action = false
        state.error = action.payload
      })

      // setDefaultAddressThunk
      .addCase(setDefaultAddressThunk.pending, (state) => {
        state.loading.action = true
        state.error = null
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.loading.action = false
        const updated = action.payload
        state.addresses.forEach((a) => {
          a.isDefault = a.id === updated.id
        })
        state.selectedAddressId = updated.id
      })
      .addCase(setDefaultAddressThunk.rejected, (state, action) => {
        state.loading.action = false
        state.error = action.payload
      })
  },
})

export const { setSelectedAddressId, clearAddressError } = addressSlice.actions
export default addressSlice.reducer
