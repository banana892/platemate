import { HTTP } from '../constants/httpStatus.js'
import * as couponService from '../services/coupon.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getAvailableCoupons(req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Available coupons retrieved successfully',
    data: result,
  })
})
