import { HTTP } from '../constants/httpStatus.js'
import * as checkoutService from '../services/checkout.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const validateCheckout = asyncHandler(async (req, res) => {
  const result = await checkoutService.validateCheckout(req.user.id, req.body)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Checkout details validated successfully',
    data: result,
  })
})
