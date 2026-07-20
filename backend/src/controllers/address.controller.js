import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as addressService from '../services/address.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADDRESSES_FETCHED,
    data: addresses,
  })
})

export const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: MSG.ADDRESS_CREATED,
    data: address,
  })
})

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params
  const address = await addressService.updateAddress(req.user.id, id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADDRESS_UPDATED,
    data: address,
  })
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await addressService.deleteAddress(req.user.id, id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ADDRESS_DELETED,
    data: result,
  })
})
