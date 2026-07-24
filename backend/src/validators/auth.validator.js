/**
 * auth.validator.js — Zod Validation Schemas for Auth Endpoints
 *
 * Each schema validates the full request shape: { body, params, query }.
 * The validate() middleware in middleware/validate.js applies these.
 *
 * PASSWORD POLICY:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (!@#$%^&*...)
 *
 * This policy is enforced here via a single reusable Zod refinement.
 * The regex approach is intentionally simple and readable.
 */

import { z } from 'zod'

// ── Reusable Password Schema ────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
    'Password must contain at least one special character'
  )

// ── Register ────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
    password: passwordSchema,
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{6,14}$/, 'Please provide a valid phone number')
      .optional()
      .or(z.literal('')),
    role: z
      .preprocess((val) => {
        if (typeof val === 'string') {
          const u = val.toUpperCase()
          if (u === 'RESTAURANT' || u === 'PARTNER') return 'PARTNER'
          if (u === 'DELIVERY' || u === 'RIDER') return 'RIDER'
          if (u === 'CUSTOMER') return 'CUSTOMER'
        }
        return val
      }, z.enum(['CUSTOMER', 'PARTNER', 'RIDER']))
      .optional(),
  }),
})

// ── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
})

// ── Verify Email (token in query string) ────────────────────────────────────

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
})

// ── Resend Verification ──────────────────────────────────────────────────────

export const resendVerifySchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
  }),
})

// ── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
  }),
})

// ── Reset Password ───────────────────────────────────────────────────────────

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
  }),
})

// ── Change Password (authenticated) ─────────────────────────────────────────

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
})

// ── Google Verify ─────────────────────────────────────────────────────────────

export const googleVerifySchema = z.object({
  body: z.object({
    idToken: z.string().optional(),
    credential: z.string().optional(),
    code: z.string().optional(),
    role: z
      .preprocess((val) => {
        if (typeof val === 'string') {
          const u = val.toUpperCase()
          if (u === 'RESTAURANT' || u === 'PARTNER') return 'PARTNER'
          if (u === 'DELIVERY' || u === 'RIDER') return 'RIDER'
          if (u === 'CUSTOMER') return 'CUSTOMER'
          if (u === 'ADMIN') return 'ADMIN'
        }
        return val
      }, z.enum(['CUSTOMER', 'PARTNER', 'RIDER', 'ADMIN']))
      .optional(),
  }),
})


