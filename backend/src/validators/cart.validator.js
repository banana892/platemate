import { z } from 'zod'

export const addCartItemSchema = z.object({
  body: z.object({
    menuItemId: z.string().uuid('Invalid menu item ID format'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
})

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  }),
})

export const removeCartItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
})

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, 'Coupon code is required'),
  }),
})
