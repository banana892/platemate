import { z } from 'zod'

const coerceNumber = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val.trim() !== '') {
      const num = Number(val)
      return isNaN(num) ? undefined : num
    }
    return val
  },
  z.number().optional()
)

export const checkoutValidateSchema = z.object({
  body: z.object({
    addressId: z.string().uuid('Invalid address ID format'),
    couponCode: z.string().trim().optional().or(z.literal('')),
  }),
})

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().uuid('Invalid address ID format'),
    couponCode: z.string().trim().optional().or(z.literal('')),
    notes: z.string().trim().max(500).optional().or(z.literal('')),
  }),
})

export const getOrdersSchema = z.object({
  query: z.object({
    page: coerceNumber.default(1),
    limit: coerceNumber.default(10),
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ]).optional(),
    sortBy: z.enum(['createdAt', 'totalAmount']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
})

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID format'),
  }),
})
