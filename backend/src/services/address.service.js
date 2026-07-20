import * as addressRepo from '../repositories/address.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

/**
 * Retrieve all addresses for a user
 */
export const getAddresses = async (userId) => {
  const addresses = await addressRepo.findAddressesByUserId(userId)
  return addresses.map((addr) => ({
    id: addr.id,
    label: addr.label,
    type: addr.type,
    street: addr.street,
    landmark: addr.landmark,
    city: addr.city,
    state: addr.state,
    country: addr.country,
    postalCode: addr.postalCode,
    latitude: Number(addr.latitude),
    longitude: Number(addr.longitude),
    isDefault: addr.isDefault,
  }))
}

/**
 * Create a new address for a user
 */
export const createAddress = async (userId, data) => {
  const address = await addressRepo.createAddress(userId, data)
  return {
    id: address.id,
    label: address.label,
    type: address.type,
    street: address.street,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
    latitude: Number(address.latitude),
    longitude: Number(address.longitude),
    isDefault: address.isDefault,
  }
}

/**
 * Update an existing address
 */
export const updateAddress = async (userId, addressId, data) => {
  const address = await addressRepo.findAddressById(addressId)
  if (!address) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADDRESS_NOT_FOUND)
  }

  if (address.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  const updated = await addressRepo.updateAddress(addressId, userId, data)
  return {
    id: updated.id,
    label: updated.label,
    type: updated.type,
    street: updated.street,
    landmark: updated.landmark,
    city: updated.city,
    state: updated.state,
    country: updated.country,
    postalCode: updated.postalCode,
    latitude: Number(updated.latitude),
    longitude: Number(updated.longitude),
    isDefault: updated.isDefault,
  }
}

/**
 * Delete an address
 */
export const deleteAddress = async (userId, addressId) => {
  const address = await addressRepo.findAddressById(addressId)
  if (!address) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADDRESS_NOT_FOUND)
  }

  if (address.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  await addressRepo.deleteAddress(addressId)
  return { id: addressId }
}
