import { jest } from '@jest/globals'
import { z } from 'zod'
import { validate } from '../../../middleware/validate.js'
import { ApiError } from '../../../utils/ApiError.js'

describe('Validate Middleware', () => {
  const dummySchema = z.object({
    body: z.object({
      email: z.string().email(),
    }),
  })

  let req, res, next

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} }
    res = {}
    next = jest.fn()
  })

  it('should call next() with no errors for valid input', () => {
    req.body = { email: 'valid@example.com' }
    const middleware = validate(dummySchema)
    middleware(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('should call next(ApiError) with 422 for invalid input', () => {
    req.body = { email: 'not-an-email' }
    const middleware = validate(dummySchema)
    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    const errorArg = next.mock.calls[0][0]
    expect(errorArg).toBeInstanceOf(ApiError)
    expect(errorArg.statusCode).toBe(422)
    expect(errorArg.errors.length).toBeGreaterThan(0)
  })
})
