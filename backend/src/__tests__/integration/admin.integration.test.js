import request from 'supertest'
import app from '../../app.js'

describe('Admin & Partner API Security Integration Tests', () => {
  describe('GET /api/v1/admin/dashboard', () => {
    it('should block non-admin requests with 401 Unauthorized when no token is supplied', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/admin/audit-logs', () => {
    it('should require authentication for audit log viewing', async () => {
      const res = await request(app).get('/api/v1/admin/audit-logs')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/partner/dashboard', () => {
    it('should require authentication for partner dashboard access', async () => {
      const res = await request(app).get('/api/v1/partner/dashboard')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })
})
