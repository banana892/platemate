import { jest } from '@jest/globals'
import sanitize from '../../../middleware/sanitize.js'

describe('Sanitize Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    }
    res = {}
    next = jest.fn()
  })

  it('should strip __proto__ and constructor prototype fields from body', () => {
    req.body = JSON.parse('{"name": "Valid", "__proto__": {"polluted": true}}')
    sanitize(req, res, next)

    expect(req.body.name).toBe('Valid')
    expect(req.body.__proto__.polluted).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })

  it('should pass through normal properties unchanged', () => {
    req.body = { email: 'user@test.com', age: 25, active: true }
    sanitize(req, res, next)

    expect(req.body).toEqual({ email: 'user@test.com', age: 25, active: true })
    expect(next).toHaveBeenCalled()
  })
})
