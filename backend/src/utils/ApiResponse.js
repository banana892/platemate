/**
 * ApiResponse.js — Standardized Success Response
 *
 * WHY A RESPONSE CLASS?
 * Without this, every controller invents its own response shape:
 *   res.json({ data: ... })
 *   res.json({ result: ... })
 *   res.json({ restaurants: ... })
 *
 * The frontend then has to handle inconsistency. With ApiResponse, every
 * success response is:
 *   { success: true, statusCode, message, data, meta }
 *
 * This is also the contract your API documentation will describe.
 *
 * USAGE:
 *   return res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, 'Fetched', data))
 *   return res.status(HTTP.OK).json(new ApiResponse(HTTP.OK, 'Fetched', data, { page: 1, total: 50 }))
 */

export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {string} message    - Human-readable success message
   * @param {*}      data       - Response payload (object, array, null)
   * @param {object} [meta]     - Pagination or extra metadata
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.success = true
    this.statusCode = statusCode
    this.message = message
    this.data = data
    if (meta) this.meta = meta
  }
}
