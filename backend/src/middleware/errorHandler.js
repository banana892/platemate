/**
 * errorHandler.js — Global Error Handler Middleware
 *
 * WHY A GLOBAL HANDLER?
 * Without this, unhandled errors in routes produce Express's default response:
 * plain HTML with a stack trace — a security leak and terrible UX.
 *
 * With this handler, ALL errors — operational (ApiError) or unexpected —
 * are caught, logged, and returned as a consistent JSON response.
 *
 * HOW IT WORKS:
 * Express identifies a global error handler by its 4 parameters: (err, req, res, next)
 * It is registered LAST, after all routes and middleware in app.js.
 *
 * OPERATIONAL vs PROGRAMMER ERRORS:
 * - Operational: User not found, invalid token, duplicate email → tell the user
 * - Programmer: ReferenceError, TypeError, Prisma schema mismatch → log + hide
 *
 * PRISMA ERRORS:
 * Prisma throws specific error codes. We map them to user-friendly messages.
 * P2002 = Unique constraint violation (duplicate email/phone)
 * P2025 = Record not found
 * P2003 = Foreign key constraint violation
 */

import { ApiError } from '../utils/ApiError.js'
import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import logger from '../config/logger.js'
import { isDev } from '../config/env.js'
import * as auditService from '../security/audit.service.js'

// ── Prisma Error Mapper ────────────────────────────────────────────────────────

const handlePrismaError = (err) => {
  // Prisma known request errors have a 'code' field
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.join(', ') || 'field'
    return new ApiError(HTTP.CONFLICT, `A record with this ${field} already exists.`)
  }

  if (err.code === 'P2025') {
    // Record to update/delete not found
    return new ApiError(HTTP.NOT_FOUND, MSG.NOT_FOUND)
  }

  if (err.code === 'P2003') {
    // Foreign key constraint violation
    return new ApiError(HTTP.BAD_REQUEST, 'Referenced record does not exist.')
  }

  if (err.code === 'P2016' || err.code === 'P2021') {
    // Query interpretation / table not found (migration not run?)
    return new ApiError(HTTP.INTERNAL_ERROR, MSG.SERVER_ERROR, [], false)
  }

  // Unknown Prisma error
  return new ApiError(HTTP.INTERNAL_ERROR, MSG.SERVER_ERROR, [], false)
}

// ── JWT Error Mapper ───────────────────────────────────────────────────────────

const handleJWTError = (err) => {
  if (err.name === 'TokenExpiredError') {
    return new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_EXPIRED)
  }
  return new ApiError(HTTP.UNAUTHORIZED, MSG.TOKEN_INVALID)
}

// ── Zod Error Mapper ───────────────────────────────────────────────────────────

const handleZodError = (err) => {
  const errors = (err.issues || []).map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }))
  return new ApiError(HTTP.UNPROCESSABLE, MSG.VALIDATION_ERROR, errors)
}

// ── Global Error Handler ───────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err

  // ── Normalize error to ApiError ──────────────────────────────────────────
  if (err.name === 'ZodError') {
    error = handleZodError(err)
  } else if (err.name?.startsWith('Prisma') || err.code?.startsWith('P')) {
    error = handlePrismaError(err)
  } else if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    error = handleJWTError(err)
  } else if (!(err instanceof ApiError)) {
    // Unknown/unexpected error — wrap in a non-operational ApiError
    // In production, ALWAYS return a generic message — never leak internal details
    error = new ApiError(
      HTTP.INTERNAL_ERROR,
      isDev ? err.message : MSG.SERVER_ERROR,
      [],
      false
    )
  }

  // ── Log the error ────────────────────────────────────────────────────────
  if (!error.isOperational) {
    // Programmer errors are critical — log with full context
    logger.error(
      {
        err: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
        req: {
          method: req.method,
          url: req.url,
          ip: req.ip,
          userId: req.user?.id,
          requestId: req.id,
        },
      },
      '🔴 Unhandled error'
    )
    // Best-effort audit for unhandled server errors (fire-and-forget)
    auditService.suspiciousActivity(req, req.user?.id, `Unhandled ${err.name}: ${err.message?.slice(0, 200)}`)
  } else {
    // Operational errors are expected — log at warn level
    logger.warn(
      {
        statusCode: error.statusCode,
        message: error.message,
        url: req.url,
        userId: req.user?.id,
        requestId: req.id,
      },
      '⚠️  Operational error'
    )
  }

  // ── Send response ──────────────────────────────────────────────────────────────────
  const statusCode = error.statusCode || HTTP.INTERNAL_ERROR

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: error.message,
    errors: error.errors?.length > 0 ? error.errors : undefined,
    // Always include requestId — clients can report this to support for log correlation
    requestId: req.id || undefined,
    // Only include stack trace in development
    ...(isDev && !error.isOperational && { stack: err.stack }),
  })
}

export default errorHandler
