import * as couponRepo from '../repositories/coupon.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

/**
 * Retrieve all available valid coupons
 */
export const getAvailableCoupons = async (query = {}) => {
  const { page = 1, limit = 10 } = query
  const skip = (page - 1) * limit
  const { coupons, total } = await couponRepo.findAvailableCoupons(skip, limit)

  return {
    coupons: coupons.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discountPercent: c.discountPercent ? Number(c.discountPercent) : null,
      discountAmount: c.discountAmount ? Number(c.discountAmount) : null,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      minimumOrder: Number(c.minimumOrder),
      validUntil: c.validUntil,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Validate a coupon code against a subtotal amount.
 * Returns the coupon record and calculated discount.
 */
export const validateCoupon = async (code, subtotal) => {
  const coupon = await couponRepo.findCouponByCode(code)
  if (!coupon) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.COUPON_NOT_FOUND)
  }

  const now = new Date()

  // 1. Check active status and date bounds
  if (!coupon.isActive || now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.COUPON_EXPIRED)
  }

  // 2. Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.COUPON_INVALID)
  }

  // 3. Check minimum order threshold
  if (Number(subtotal) < Number(coupon.minimumOrder)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `${MSG.COUPON_MIN_ORDER} Minimum order required: ₹${Number(coupon.minimumOrder)}`
    )
  }

  // 4. Calculate discount
  let discount = 0
  if (coupon.discountPercent) {
    discount = Number(subtotal) * (Number(coupon.discountPercent) / 100)
    if (coupon.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount))
    }
  } else if (coupon.discountAmount) {
    discount = Math.min(Number(coupon.discountAmount), Number(subtotal))
  }

  return {
    coupon,
    discount: parseFloat(discount.toFixed(2)),
  }
}
