/**
 * ApiError.js — Custom Error Class
 *
 * WHY EXTEND ERROR?
 * When something goes wrong in a service, we need to communicate:
 *   1. What HTTP status to send (404, 409, 422...)
 *   2. What message to show the user
 *   3. Whether it's operational (expected, user-facing) or programmer error
 *
 * Operational errors (user not found, duplicate email) should be shown to
 * the user. Programmer errors (null pointer, wrong Prisma query) should be
 * caught, logged internally, and the user sees only "Something went wrong."
 *
 * USAGE:
 *   throw new ApiError(HTTP.NOT_FOUND, MSG.USER_NOT_FOUND)
 *   throw new ApiError(HTTP.CONFLICT, MSG.EMAIL_ALREADY_EXISTS)
 *   throw new ApiError(HTTP.UNPROCESSABLE, MSG.VALIDATION_ERROR, [
 *     { field: 'email', message: 'Invalid email format' }
 *   ])
 */

export class ApiError extends Error {
  /**
   * @param {number}   statusCode    - HTTP status code (4xx or 5xx)
   * @param {string}   message       - User-facing error message
   * @param {Array}    [errors=[]]   - Detailed field-level errors (validation)
   * @param {boolean}  [isOperational=true] - Operational vs programmer error
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message)

    // Preserves proper stack trace in V8 (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    this.name = 'ApiError'
    this.statusCode = statusCode
    this.message = message
    this.errors = errors
    this.isOperational = isOperational
    this.success = false
  }

  // ── Static factory methods for common errors ──────────────────────────────
  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors)
  }

  static unauthorized(message) {
    return new ApiError(401, message)
  }

  static forbidden(message) {
    return new ApiError(403, message)
  }

  static notFound(message) {
    return new ApiError(404, message)
  }

  static conflict(message) {
    return new ApiError(409, message)
  }

  static validation(message, errors = []) {
    return new ApiError(422, message, errors)
  }

  static tooManyRequests(message) {
    return new ApiError(429, message)
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false) // Not operational — don't expose details
  }
}
