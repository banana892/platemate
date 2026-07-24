import request from 'supertest'
import app from '../../app.js'

describe('Auth & System API Integration Tests', () => {
  describe('GET /api/v1/health', () => {
    it('should return 200 OK with system status', async () => {
      const res = await request(app).get('/api/v1/health')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.status).toBe('ok')
      expect(res.headers['x-request-id']).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/login validation', () => {
    it('should return 422 for missing body fields', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({})

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Validation failed')
    })

    it('should return 422 for malformed email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'Password@123' })

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/register validation', () => {
    it('should reject registration requests with weak passwords', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test',
        email: 'test@example.com',
        password: 'weak',
      })

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
    })
  })
})
