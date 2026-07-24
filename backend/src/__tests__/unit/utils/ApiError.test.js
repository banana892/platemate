import { ApiError } from '../../../utils/ApiError.js'

describe('ApiError Class', () => {
  it('should instantiate custom ApiError with status, message, and defaults', () => {
    const err = new ApiError(400, 'Bad request test')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiError')
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Bad request test')
    expect(err.errors).toEqual([])
    expect(err.isOperational).toBe(true)
    expect(err.success).toBe(false)
  })

  it('static badRequest factory', () => {
    const err = ApiError.badRequest('Invalid input', [{ field: 'name', message: 'Required' }])
    expect(err.statusCode).toBe(400)
    expect(err.errors.length).toBe(1)
  })

  it('static unauthorized factory', () => {
    const err = ApiError.unauthorized('Token expired')
    expect(err.statusCode).toBe(401)
  })

  it('static forbidden factory', () => {
    const err = ApiError.forbidden('Access denied')
    expect(err.statusCode).toBe(403)
  })

  it('static notFound factory', () => {
    const err = ApiError.notFound('Resource not found')
    expect(err.statusCode).toBe(404)
  })

  it('static conflict factory', () => {
    const err = ApiError.conflict('Email exists')
    expect(err.statusCode).toBe(409)
  })

  it('static validation factory', () => {
    const err = ApiError.validation('Validation failed')
    expect(err.statusCode).toBe(422)
  })

  it('static tooManyRequests factory', () => {
    const err = ApiError.tooManyRequests('Rate limit exceeded')
    expect(err.statusCode).toBe(429)
  })

  it('static internal factory setting isOperational=false', () => {
    const err = ApiError.internal('Database crash')
    expect(err.statusCode).toBe(500)
    expect(err.isOperational).toBe(false)
  })
})
