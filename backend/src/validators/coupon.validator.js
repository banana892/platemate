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

export const availableCouponsSchema = z.object({
  query: z.object({
    page: coerceNumber.default(1),
    limit: coerceNumber.default(10),
  }),
})
