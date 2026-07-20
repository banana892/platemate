import { z } from 'zod'

const coerceBoolean = z.preprocess(
  (val) => {
    if (val === 'true' || val === '1') return true
    if (val === 'false' || val === '0') return false
    return undefined
  },
  z.boolean().optional()
)

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

export const listRestaurantsSchema = z.object({
  query: z.object({
    page: coerceNumber.default(1),
    limit: coerceNumber.default(10),
    sortBy: z.enum(['rating', 'deliveryTime', 'deliveryFee', 'minimumOrder', 'createdAt', 'name']).optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().trim().optional(),
    cuisines: z.string().trim().optional(),
    veg: coerceBoolean,
    rating: coerceNumber.superRefine((val, ctx) => {
      if (val !== undefined && (val < 0 || val > 5)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Rating must be between 0 and 5',
        })
      }
    }),
    minPrice: coerceNumber,
    maxPrice: coerceNumber,
    deliveryTime: coerceNumber,
    openNow: coerceBoolean,
    latitude: coerceNumber.superRefine((val, ctx) => {
      if (val !== undefined && (val < -90 || val > 90)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Latitude must be between -90 and 90',
        })
      }
    }),
    longitude: coerceNumber.superRefine((val, ctx) => {
      if (val !== undefined && (val < -180 || val > 180)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Longitude must be between -180 and 180',
        })
      }
    }),
  }),
})

export const getRestaurantSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug or ID is required'),
  }),
})

export const getMenuSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug or ID is required'),
  }),
  query: z.object({
    veg: coerceBoolean,
    search: z.string().trim().optional(),
  }),
})

export const getReviewsSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug or ID is required'),
  }),
  query: z.object({
    page: coerceNumber.default(1),
    limit: coerceNumber.default(10),
  }),
})
