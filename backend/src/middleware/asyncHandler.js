/**
 * asyncHandler.js — Async Route Error Wrapper
 *
 * THE PROBLEM:
 * Every async route handler needs try/catch:
 *   router.get('/', async (req, res, next) => {
 *     try {
 *       const data = await someService()
 *       res.json(data)
 *     } catch (err) {
 *       next(err) // ← you MUST call next(err) for Express to handle it
 *     }
 *   })
 *
 * With 30+ routes, that's 30 try/catch blocks. This is boilerplate noise that
 * obscures the actual business logic.
 *
 * THE SOLUTION:
 * A higher-order function that wraps the handler and calls next(err) for you.
 *
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await someService() // If this throws, next(err) is called
 *     res.json(data)
 *   }))
 *
 * ALTERNATIVE:
 * We also install the 'express-async-errors' package which monkey-patches
 * Express to handle this automatically. asyncHandler is kept as an explicit,
 * readable alternative.
 */

/**
 * @param {Function} fn - An async Express route handler
 * @returns {Function}  - A wrapped handler that catches errors and calls next(err)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
