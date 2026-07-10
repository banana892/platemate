/**
 * httpStatus.js — HTTP Status Code Constants
 *
 * WHY NOT JUST USE NUMBERS?
 * Writing `res.status(422)` is cryptic. Writing `res.status(HTTP.UNPROCESSABLE)`
 * is self-documenting. When a new developer reads the code, they know
 * immediately what's happening without looking up status codes.
 *
 * These match RFC 9110 (HTTP Semantics) naming conventions.
 */

export const HTTP = {
  // 2xx — Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx — Redirection
  MOVED_PERMANENTLY: 301,
  NOT_MODIFIED: 304,

  // 4xx — Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,       // Not authenticated
  FORBIDDEN: 403,           // Authenticated but not authorized
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,            // Resource already exists (duplicate email, etc.)
  GONE: 410,                // Resource permanently deleted
  UNPROCESSABLE: 422,       // Validation errors
  TOO_MANY_REQUESTS: 429,   // Rate limited

  // 5xx — Server Errors
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}
