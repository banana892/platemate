import { parsePagination, buildMeta } from '../../../utils/pagination.js'

describe('Pagination Utility', () => {
  describe('parsePagination', () => {
    it('should return default page (1) and limit (20) when no query params are given', () => {
      const res = parsePagination({})
      expect(res).toEqual({
        page: 1,
        limit: 20,
        skip: 0,
        take: 20,
      })
    })

    it('should parse valid string query parameters correctly', () => {
      const res = parsePagination({ page: '3', limit: '15' })
      expect(res).toEqual({
        page: 3,
        limit: 15,
        skip: 30,
        take: 15,
      })
    })

    it('should sanitize negative, zero or non-integer page/limit values to defaults', () => {
      const res = parsePagination({ page: '-5', limit: 'invalid' })
      expect(res.page).toBe(1)
      expect(res.limit).toBe(20)
    })

    it('should cap limit at maximum limit (100)', () => {
      const res = parsePagination({ page: '1', limit: '500' })
      expect(res.limit).toBe(100)
    })
  })

  describe('buildMeta', () => {
    it('should compute totalPages and navigation flags accurately', () => {
      const meta = buildMeta(45, 2, 20)
      expect(meta).toEqual({
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      })
    })

    it('should handle edge cases like page 1 with no prev page', () => {
      const meta = buildMeta(10, 1, 20)
      expect(meta.hasPrevPage).toBe(false)
      expect(meta.hasNextPage).toBe(false)
      expect(meta.totalPages).toBe(1)
    })

    it('should handle 0 total items gracefully', () => {
      const meta = buildMeta(0, 1, 20)
      expect(meta.totalPages).toBe(0)
      expect(meta.hasNextPage).toBe(false)
      expect(meta.hasPrevPage).toBe(false)
    })
  })
})
