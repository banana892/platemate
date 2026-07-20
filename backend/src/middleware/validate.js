/**
 * validate.js — Zod Request Validation Middleware
 *
 * WHY MIDDLEWARE VALIDATION?
 * If validation lives in the controller, it mixes concerns:
 *   controller = handle HTTP + validate input + call service + send response
 *
 * That's too much. The controller should only:
 *   controller = extract validated data → call service → send response
 *
 * By validating in middleware, the controller can assume req.body is safe
 * and correctly typed.
 *
 * HOW TO USE:
 *   import { validate } from '../middleware/validate.js'
 *   import { registerSchema } from '../validators/auth.validator.js'
 *
 *   router.post('/register', validate(registerSchema), authController.register)
 *
 * The schema can validate body, params, and query simultaneously.
 *
 * EXAMPLE SCHEMA:
 *   export const registerSchema = z.object({
 *     body: z.object({
 *       email: z.string().email(),
 *       password: z.string().min(8),
 *     }),
 *     params: z.object({}).optional(),
 *     query: z.object({}).optional(),
 *   })
 */

import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'

/**
 * Zod validation middleware factory
 * @param {ZodSchema} schema - A Zod schema with { body, params, query } shape
 * @returns Express middleware
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    })

    // Overwrite req fields with Zod-parsed (and potentially transformed) values
    // This ensures type coercion (e.g., "true" string → true boolean) is applied
    req.body = validated.body || req.body
    req.params = validated.params || req.params
    req.query = validated.query || req.query

    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = (err.issues || []).map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return next(new ApiError(422, MSG.VALIDATION_ERROR, errors))
    }
    next(err)
  }
}
