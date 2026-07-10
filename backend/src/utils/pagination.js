/**
 * pagination.js — Reusable Pagination Utility
 *
 * WHY CENTRALIZE PAGINATION?
 * Without this, every list endpoint re-implements skip/take/total logic,
 * usually slightly differently. One centralized function ensures:
 * 1. Consistent API response shape for pagination metadata
 * 2. Safe defaults (page=1, limit=20, max limit=100)
 * 3. No accidental negative values from malformed query strings
 *
 * USAGE:
 *   const { skip, take, page, limit } = parsePagination(req.query)
 *   const [items, total] = await Promise.all([
 *     db.restaurant.findMany({ skip, take }),
 *     db.restaurant.count()
 *   ])
 *   const meta = buildMeta(total, page, limit)
 *   return res.json(new ApiResponse(200, 'Fetched', items, meta))
 */

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Parse and sanitize pagination query params
 * @param {object} query - req.query
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
export const parsePagination = (query = {}) => {
  // Parse integers, fall back to defaults if NaN or negative
  let page = parseInt(query.page, 10)
  let limit = parseInt(query.limit, 10)

  if (!Number.isInteger(page) || page < 1) page = DEFAULT_PAGE
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT
  if (limit > MAX_LIMIT) limit = MAX_LIMIT

  const skip = (page - 1) * limit
  const take = limit

  return { skip, take, page, limit }
}

/**
 * Build the pagination metadata object for the response
 * @param {number} total  - Total number of records (from db.count())
 * @param {number} page   - Current page number
 * @param {number} limit  - Items per page
 * @returns {object}      - Pagination meta
 */
export const buildMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
