import { z } from 'zod'

export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID format'),
  }),
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().trim().max(1000).optional().or(z.literal('')),
  }),
})
