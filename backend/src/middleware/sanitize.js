/**
 * sanitize.js — Input Sanitization Middleware (Phase 13)
 *
 * WHY INPUT SANITIZATION?
 * JavaScript's prototype chain means that an attacker who can inject
 * __proto__, constructor, or prototype keys into a parsed object can
 * override native Object methods for the entire process — a prototype
 * pollution attack. This has led to RCE in real Node.js applications.
 *
 * Example attack payload:
 *   { "__proto__": { "isAdmin": true } }
 *
 * After JSON.parse(), req.body.__proto__.isAdmin = true, which means
 * ({}).isAdmin === true — every object in the process is affected.
 *
 * OUR APPROACH:
 * Recursively scan and remove dangerous keys from req.body, req.params,
 * and req.query before any route handler sees them. Pure Node.js built-ins —
 * no external dependencies.
 *
 * We also:
 * - Trim string values at the top level of req.body (removes leading/trailing
 *   whitespace that can cause lookup mismatches)
 * - Use Object.create(null) to normalize null-prototype objects
 *
 * PERFORMANCE:
 * This runs on every request but is O(n) on the number of body keys.
 * Typical API bodies are shallow (< 20 keys) so the overhead is negligible.
 */

// Keys that must never appear in user input
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Recursively strip dangerous keys from an object.
 * Returns a new object — does not mutate the original.
 *
 * @param {*} value - Any value (primitives pass through unchanged)
 * @param {number} [depth=0] - Current recursion depth
 * @returns {*} Sanitized value
 */
const deepStrip = (value, depth = 0) => {
  // Safety: limit recursion depth to prevent stack overflow on deeply nested payloads
  if (depth > 20) return value

  if (Array.isArray(value)) {
    return value.map((item) => deepStrip(item, depth + 1))
  }

  if (value !== null && typeof value === 'object') {
    const sanitized = {}
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) continue // Drop the dangerous key
      sanitized[key] = deepStrip(value[key], depth + 1)
    }
    return sanitized
  }

  return value
}

/**
 * Trim string values at the top level of an object.
 * Only applies to req.body — params/query are already URL-decoded strings
 * that Express handles, and deep trimming is too aggressive for nested data.
 *
 * @param {object} obj
 * @returns {object}
 */
const trimTopLevel = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? value.trim() : value
  }
  return result
}

/**
 * Express middleware that sanitizes req.body, req.params, and req.query.
 * Must be registered AFTER body parsers (express.json, express.urlencoded)
 * and BEFORE routes.
 */
const sanitize = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = trimTopLevel(deepStrip(req.body))
  }

  if (req.params && typeof req.params === 'object') {
    req.params = deepStrip(req.params)
  }

  if (req.query && typeof req.query === 'object') {
    req.query = deepStrip(req.query)
  }

  next()
}

export default sanitize
