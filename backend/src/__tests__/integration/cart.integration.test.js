import request from 'supertest'
import app from '../../app.js'

describe('Cart API Integration Tests', () => {
  describe('GET /api/v1/cart', () => {
    it('should return 401 Unauthorized for unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/cart')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/cart/items', () => {
    it('should return 401 Unauthorized when adding item without Bearer token', async () => {
      const res = await request(app).post('/api/v1/cart/items').send({
        menuItemId: '00000000-0000-0000-0000-000000000000',
        quantity: 1,
      })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('DELETE /api/v1/cart', () => {
    it('should require authentication to clear cart', async () => {
      const res = await request(app).delete('/api/v1/cart')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })
})
