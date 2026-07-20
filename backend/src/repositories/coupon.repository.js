import prisma from '../config/db.js'

/**
 * Find coupon details by code (normalized to uppercase)
 */
export const findCouponByCode = async (code) => {
  return prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  })
}

/**
 * Retrieve all active and valid coupons
 */
export const findAvailableCoupons = async (skip = 0, take = 10) => {
  const now = new Date()
  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { validUntil: 'asc' },
      skip,
      take,
    }),
    prisma.coupon.count({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
    }),
  ])

  return { coupons, total }
}

/**
 * Increment the used count of a coupon (useful on order placement)
 */
export const incrementCouponUsedCount = async (couponId, tx = prisma) => {
  return tx.coupon.update({
    where: { id: couponId },
    data: {
      usedCount: { increment: 1 },
    },
  })
}
