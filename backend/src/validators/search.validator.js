import { z } from 'zod'

export const searchSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1, 'Search query must be at least 1 character'),
  }),
})
