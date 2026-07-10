/**
 * app.js — Express Application (NO server.listen here)
 *
 * WHY SEPARATE app.js FROM server.js?
 * This is a critical pattern that most tutorials skip:
 *
 * app.js    = "what the app does" (middleware, routes, error handling)
 * server.js = "how the app runs" (http.createServer, port, socket.io)
 *
 * Benefits:
 * 1. Testing: Import app.js in tests without starting a real server
 *    supertest(app) works without binding to a port
 * 2. Socket.io: server.js creates the HTTP server that socket.io attaches to
 * 3. Clarity: New developers immediately understand what each file does
 *
 * MIDDLEWARE ORDER MATTERS IN EXPRESS:
 * Express executes middleware in the order it is registered.
 * The correct order is:
 * 1. Security headers (helmet, cors)
 * 2. Request parsing (json, urlencoded, cookies)
 * 3. Logging (pino-http — logs every request)
 * 4. Compression (gzip — before routes send responses)
 * 5. Rate limiting
 * 6. Routes
 * 7. 404 handler (catches unmatched routes)
 * 8. Global error handler (MUST be last, MUST have 4 params)
 */

import 'express-async-errors' // Patches Express to handle async errors without try/catch
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'

import { env, allowedOrigins, isDev } from './config/env.js'
import logger from './config/logger.js'
import apiRoutes from './routes/index.js'
import errorHandler from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { ApiError } from './utils/ApiError.js'
import { HTTP } from './constants/httpStatus.js'

const app = express()

// ── 1. Security Headers (Helmet) ──────────────────────────────────────────────
// Helmet sets ~14 HTTP headers that protect against common attacks:
// - X-Frame-Options: prevents clickjacking
// - X-Content-Type-Options: prevents MIME sniffing
// - Strict-Transport-Security: forces HTTPS
// - Content-Security-Policy: prevents XSS and data injection
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
    contentSecurityPolicy: isDev ? false : {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'res.cloudinary.com', 'data:'],
        scriptSrc: ["'self'"],
      },
    },
  })
)

// ── 2. CORS Configuration ─────────────────────────────────────────────────────
// Cross-Origin Resource Sharing: controls which origins can call our API.
// Without this, browsers block API calls from a different domain.
// 'credentials: true' is required for cookies (refresh tokens) to be sent.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        logger.warn({ origin }, 'CORS: blocked request from unauthorized origin')
        callback(new Error('Not allowed by CORS policy'))
      }
    },
    credentials: true, // Required for httpOnly cookie (refresh token)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── 3. Body Parsing ───────────────────────────────────────────────────────────
// Parse JSON bodies (req.body)
app.use(express.json({ limit: '10kb' })) // Limit body size to prevent large payload attacks

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Parse cookies (used for the refresh token httpOnly cookie)
app.use(cookieParser())

// ── 4. HTTP Request Logging ───────────────────────────────────────────────────
// Logs every HTTP request with method, URL, status, response time
// In development: pretty formatted; in production: JSON
app.use(
  pinoHttp({
    logger,
    // Don't log health check requests (would flood logs in production)
    autoLogging: {
      ignore: (req) => req.url === `/api/${env.API_VERSION}/health`,
    },
    // Customize what gets logged per request
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error'
      if (res.statusCode >= 400) return 'warn'
      return 'info'
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
)

// ── 5. Response Compression ───────────────────────────────────────────────────
// Compresses responses with gzip/deflate. Reduces bandwidth by 60-80%.
// Only compresses responses larger than 1KB (threshold default).
app.use(compression())

// ── 6. General Rate Limiting ──────────────────────────────────────────────────
// Applied to all routes. Auth-specific routes have stricter limits in auth.routes.js
app.use(`/api/${env.API_VERSION}`, generalLimiter)

// ── 7. API Routes ─────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, apiRoutes)

// ── 8. 404 Handler ────────────────────────────────────────────────────────────
// If no route matched, we reach here. This must be AFTER all routes.
app.use((req, res, next) => {
  next(
    new ApiError(
      HTTP.NOT_FOUND,
      `Cannot ${req.method} ${req.originalUrl} — route not found`
    )
  )
})

// ── 9. Global Error Handler ───────────────────────────────────────────────────
// MUST be registered last. MUST have exactly 4 parameters: (err, req, res, next)
// This catches all errors thrown anywhere in the application.
app.use(errorHandler)

export default app
