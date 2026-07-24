import * as addressRepo from '../repositories/address.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

const invalidateAddressCache = async (userId) => {
  try {
    const { deleteCache } = await import('../redis/redis.service.js')
    const { CACHE_KEYS } = await import('../redis/cache.constants.js')
    await deleteCache(CACHE_KEYS.ADDRESSES(userId))
  } catch (err) {}
}

const formatAddressOutput = (addr) => ({
  id: addr.id,
  userId: addr.userId,
  label: addr.label,
  type: addr.type,
  recipientName: addr.recipientName,
  phone: addr.phone,
  houseNumber: addr.houseNumber,
  formattedAddress: addr.formattedAddress,
  street: addr.street || addr.formattedAddress || addr.houseNumber || '',
  landmark: addr.landmark,
  city: addr.city,
  state: addr.state,
  country: addr.country,
  postalCode: addr.postalCode,
  latitude: Number(addr.latitude),
  longitude: Number(addr.longitude),
  isDefault: addr.isDefault,
  createdAt: addr.createdAt,
  updatedAt: addr.updatedAt,
})

/**
 * Retrieve all addresses for a user
 */
export const getAddresses = async (userId) => {
  const { getCache, setCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS, CACHE_TTLS } = await import('../redis/cache.constants.js')

  const cacheKey = CACHE_KEYS.ADDRESSES(userId)
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const addresses = await addressRepo.findAddressesByUserId(userId)
  const result = addresses.map(formatAddressOutput)

  await setCache(cacheKey, result, CACHE_TTLS.ADDRESSES)
  return result
}

/**
 * Retrieve a single address by ID
 */
export const getAddressById = async (userId, addressId) => {
  const address = await addressRepo.findAddressById(addressId)
  if (!address) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADDRESS_NOT_FOUND)
  }

  if (address.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  return formatAddressOutput(address)
}

/**
 * Create a new address for a user
 */
export const createAddress = async (userId, data) => {
  const address = await addressRepo.createAddress(userId, data)
  await invalidateAddressCache(userId)
  return formatAddressOutput(address)
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
  await invalidateAddressCache(userId)
  return formatAddressOutput(updated)
}

/**
 * Set an address as default
 */
export const setDefaultAddress = async (userId, addressId) => {
  const address = await addressRepo.findAddressById(addressId)
  if (!address) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADDRESS_NOT_FOUND)
  }

  if (address.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  const updated = await addressRepo.setDefaultAddress(addressId, userId)
  await invalidateAddressCache(userId)
  return formatAddressOutput(updated)
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
  await invalidateAddressCache(userId)
  return { id: addressId }
}

