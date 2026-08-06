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
import { getHealth } from './controllers/health.controller.js'
import requestId from './middleware/requestId.js'
import sanitize from './middleware/sanitize.js'
import { SECURITY_CONFIG } from './security/security.config.js'

const app = express()

// Trust reverse proxy (Railway, Render, Vercel, Cloudflare, Nginx)
// Required for express-rate-limit to read X-Forwarded-For headers correctly
app.set('trust proxy', 1)

// Root level health check for cloud platform monitors (Render, AWS, Railway)
app.get('/health', getHealth)

// ── 0. Request ID ──────────────────────────────────────────────────────────────────
// Attach a unique requestId to every request BEFORE anything else.
// This ensures req.id is available in all subsequent middleware, services,
// and error handlers for log correlation and audit event threading.
app.use(requestId)

// ── 1. Security Headers (Helmet) ─────────────────────────────────────────────────────
// Helmet sets ~14 HTTP headers that protect against common attacks:
// - X-Frame-Options: prevents clickjacking
// - X-Content-Type-Options: prevents MIME sniffing
// - Strict-Transport-Security: forces HTTPS
// - Content-Security-Policy: prevents XSS and data injection
//
// CSP is sourced from SECURITY_CONFIG.csp.directives so all thresholds
// live in one file. reportOnly mode is supported for staged rollout.
const cspDirectives = SECURITY_CONFIG.csp.directives

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
    // In dev: disable CSP for DX. In prod: enforce strict policy.
    // If reportOnly = true: set header manually below (Helmet doesn't support Report-Only).
    contentSecurityPolicy: isDev
      ? false
      : SECURITY_CONFIG.csp.reportOnly
        ? false  // Will be set manually as Content-Security-Policy-Report-Only
        : { directives: cspDirectives },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
)

// CSP Report-Only mode: send violations to our endpoint without blocking.
// Set SECURITY_CONFIG.csp.reportOnly = true to use this during CSP rollout.
if (!isDev && SECURITY_CONFIG.csp.reportOnly) {
  app.use((_req, res, next) => {
    const dirStr = Object.entries(cspDirectives)
      .map(([k, v]) => {
        const kebab = k.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`)
        return `${kebab} ${v.join(' ')}`
      })
      .join('; ')
    res.setHeader(
      'Content-Security-Policy-Report-Only',
      `${dirStr}; report-uri ${SECURITY_CONFIG.csp.reportUri}`
    )
    next()
  })
}

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

// ── 3. Body Parsing ──────────────────────────────────────────────────────────────────
// Parse JSON bodies (req.body)
app.use(express.json({ limit: '10kb' })) // Limit body size to prevent large payload attacks

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Parse cookies (used for the refresh token httpOnly cookie)
app.use(cookieParser())

// ── 3a. Input Sanitization ────────────────────────────────────────────────────────────────
// Strips __proto__, constructor, prototype keys to prevent prototype pollution.
// Must run AFTER body parsing (needs req.body to exist) and BEFORE routes.
app.use(sanitize)

// ── 4. HTTP Request Logging ───────────────────────────────────────────────────────────
// Logs every HTTP request with method, URL, status, response time
// In development: pretty formatted; in production: JSON
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id, // Thread the requestId from middleware into every Pino log line
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
        id: req.id, // Include requestId in request log line
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

// ── 6. General Rate Limiting ────────────────────────────────────────────────────────────────
// Applied to all routes. Auth-specific routes have stricter limits in auth.routes.js
app.use(`/api/${env.API_VERSION}`, generalLimiter)

// ── 6a. CSP Violation Report Endpoint ────────────────────────────────────────────────────
// Browsers send CSP violation reports here as JSON (application/csp-report).
// No authentication required — browsers post this directly.
// Registered before apiRoutes so it isn't wrapped by auth middleware.
app.post(
  SECURITY_CONFIG.csp.reportUri,
  express.json({ type: ['application/json', 'application/csp-report'], limit: '10kb' }),
  (req, res) => {
    logger.warn({ cspReport: req.body, requestId: req.id }, '⚠️  CSP Violation Report received')
    res.status(204).end()
  }
)

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
