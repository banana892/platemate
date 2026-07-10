/**
 * auth.routes.js — Authentication Route Definitions
 *
 * Route structure follows REST conventions:
 * POST   /auth/register         — create account
 * POST   /auth/login            — authenticate
 * POST   /auth/logout           — revoke session
 * POST   /auth/refresh          — issue new access token
 * GET    /auth/me               — get current user
 * POST   /auth/verify-email     — verify email with token
 * POST   /auth/resend-verify    — resend verification email
 * POST   /auth/forgot-password  — send reset email
 * POST   /auth/reset-password   — apply new password
 *
 * Controllers are imported but not yet implemented — they'll be filled
 * fully in Phase 4. Having the route definitions here now means app.js
 * can start, and the routes just 501 if called prematurely.
 */

import { Router } from 'express'
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js'
import { authenticate } from '../middleware/auth.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

// Apply strict rate limiting to all auth routes
router.use(authLimiter)

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refreshToken)
router.get('/verify-email', authController.verifyEmail)
router.post('/resend-verify', authController.resendVerification)
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// ── Protected Routes ───────────────────────────────────────────────────────────
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getMe)

export default router
