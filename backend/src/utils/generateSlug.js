/**
 * generateSlug.js — URL-safe Slug Generator
 *
 * WHY SLUGS?
 * /restaurants/biryani-house-koramangala is better than /restaurants/a3f8c2d1
 * Slugs are:
 * - SEO-friendly (keywords in URL)
 * - Human-readable (shareable)
 * - Bookmarkable
 *
 * WHY NOT JUST USE THE NAME?
 * "Biryani House & Restaurant!" → "biryani-house-restaurant"
 * Special characters, spaces, and Unicode need to be sanitized.
 *
 * UNIQUENESS:
 * If "Pizza Palace" already exists, we append a short UUID suffix:
 * "pizza-palace-a3f8"
 * This prevents UNIQUE constraint violations.
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * Convert a string to a URL-safe slug
 * @param {string} text - e.g. "Biryani House & Restaurant!"
 * @returns {string}    - e.g. "biryani-house-restaurant"
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')                  // Normalize unicode (é → e)
    .replace(/[\u0300-\u036f]/g, '')   // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // Remove special characters
    .replace(/[\s_]+/g, '-')           // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-')               // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')           // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug with a short UUID suffix
 * Use this when creating records to guarantee uniqueness
 * @param {string} text
 * @returns {string} - e.g. "biryani-house-a3f8c2d1"
 */
export const generateUniqueSlug = (text) => {
  const base = slugify(text)
  const suffix = uuidv4().split('-')[0] // First 8 characters
  return `${base}-${suffix}`
}

/**
 * Generate a sequential order number
 * Format: PM-YYYYMMDD-XXXXX (PM = PlateMate)
 * e.g. PM-20260710-00042
 */
export const generateOrderNumber = () => {
  const date = new Date()
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `PM-${datePart}-${randomPart}`
}
