/**
 * auth.routes.js — Authentication Route Definitions
 *
 * Route structure follows REST conventions:
 * POST   /auth/register         — create account
 * POST   /auth/login            — authenticate
 * POST   /auth/logout           — revoke session (single device)
 * POST   /auth/logout-all       — revoke all sessions (all devices)
 * POST   /auth/refresh          — issue new access token (token rotation)
 * GET    /auth/me               — get current user profile
 * GET    /auth/verify-email     — verify email with token
 * POST   /auth/resend-verify    — resend verification email
 * POST   /auth/forgot-password  — send reset email
 * POST   /auth/reset-password   — apply new password
 * POST   /auth/change-password  — change password (authenticated)
 *
 * MIDDLEWARE ORDER:
 * 1. Rate limiters (authLimiter for all, passwordResetLimiter for forgot)
 * 2. Validation (Zod schemas via validate middleware)
 * 3. Authentication (where required)
 * 4. Controller handler
 */

import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { rateLimitMiddleware } from '../redis/cache.middleware.js'
import * as authController from '../controllers/auth.controller.js'
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  googleVerifySchema,
} from '../validators/auth.validator.js'

const router = Router()

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', rateLimitMiddleware('register', 5, 60), validate(registerSchema), authController.register)
router.post('/login', rateLimitMiddleware('login', 20, 60), validate(loginSchema), authController.login)
router.post('/refresh', authController.refreshToken)
router.get('/verify-email', rateLimitMiddleware('verify-email', 5, 60), validate(verifyEmailSchema), authController.verifyEmail)
router.post('/resend-verify', rateLimitMiddleware('resend-verify', 3, 60), validate(resendVerifySchema), authController.resendVerification)
router.post('/forgot-password', rateLimitMiddleware('forgot-password', 3, 60), validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

// Google OAuth
router.get('/google', authController.googleRedirect)
router.get('/google/callback', authController.googleCallback)
router.post('/google', validate(googleVerifySchema), authController.googleVerify)
router.post('/google/verify', validate(googleVerifySchema), authController.googleVerify)

// ── Protected Routes ───────────────────────────────────────────────────────────
router.post('/logout', optionalAuthenticate, authController.logout)
router.post('/logout-all', authenticate, authController.logoutAll)
router.get('/me', authenticate, authController.getMe)
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword)

export default router

