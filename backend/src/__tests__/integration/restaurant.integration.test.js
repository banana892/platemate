import request from 'supertest'
import app from '../../app.js'

describe('Restaurant & Search API Integration Tests', () => {
  describe('GET /api/v1/restaurants', () => {
    it('should return list of active restaurants', async () => {
      const res = await request(app).get('/api/v1/restaurants')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
    })
  })

  describe('GET /api/v1/restaurants/featured', () => {
    it('should return featured restaurants', async () => {
      const res = await request(app).get('/api/v1/restaurants/featured')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('GET /api/v1/restaurants/:slug (404)', () => {
    it('should return 404 for non-existent restaurant slug', async () => {
      const res = await request(app).get('/api/v1/restaurants/non-existent-slug-99999')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/search', () => {
    it('should return grouped search results for query', async () => {
      const res = await request(app).get('/api/v1/search?q=Burger')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
    })
  })
})
