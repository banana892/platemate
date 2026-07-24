import { slugify, generateUniqueSlug, generateOrderNumber } from '../../../utils/generateSlug.js'

describe('Slug & Order Generator Utilities', () => {
  describe('slugify', () => {
    it('should convert strings to lowercase hypenated slugs', () => {
      expect(slugify('Biryani House & Cafe')).toBe('biryani-house-cafe')
    })

    it('should normalize accents and strip special characters', () => {
      expect(slugify('Café Délices!!!')).toBe('cafe-delices')
    })

    it('should collapse multiple spaces and hyphens', () => {
      expect(slugify('   Super   Tasty  -  Pizza--- ')).toBe('super-tasty-pizza')
    })
  })

  describe('generateUniqueSlug', () => {
    it('should generate slug with 8-character unique UUID suffix', () => {
      const slug = generateUniqueSlug('Royal Biryani')
      expect(slug).toMatch(/^royal-biryani-[a-f0-9]{8}$/)
    })

    it('should produce unique slugs across multiple calls for same input', () => {
      const slug1 = generateUniqueSlug('Test Item')
      const slug2 = generateUniqueSlug('Test Item')
      expect(slug1).not.toBe(slug2)
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number in PM-YYYYMMDD-XXXXX format', () => {
      const orderNum = generateOrderNumber()
      expect(orderNum).toMatch(/^PM-\d{8}-\d{5}$/)
    })
  })
})
