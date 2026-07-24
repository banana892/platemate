/**
 * env.js — Centralized, Zod-validated environment configuration
 *
 * WHY THIS EXISTS:
 * If DATABASE_URL is undefined and we only find out when a DB query fails at
 * runtime, we've wasted time debugging. Zod validates all env vars at startup
 * and throws a clear error immediately if anything is missing or malformed.
 *
 * PATTERN: Parse, don't validate. Transform raw strings into typed values here
 * so the rest of the codebase works with proper types (numbers, booleans, etc.)
 */

import { z } from 'zod'
import 'dotenv/config'

// ── Schema ────────────────────────────────────────────────────────────────────
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_TTL_DEFAULT: z.string().default('3600').transform(Number),
  REDIS_PREFIX: z.string().default('platemate:'),
  RATE_LIMIT_WINDOW: z.string().default('60').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@platemate.com'),
  FROM_NAME: z.string().default('PlateMate'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // CORS
  CLIENT_URL: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),

  // App
  APP_NAME: z.string().default('PlateMate'),
  API_VERSION: z.string().default('v1'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  // Bcrypt
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),

  // Token expiry for email flows
  EMAIL_VERIFY_EXPIRES: z.string().default('24h'),
  PASSWORD_RESET_EXPIRES: z.string().default('1h'),
}).superRefine((data, ctx) => {
  // In production, certain credentials are mandatory.
  // The server must never start in production without payment or media providers configured.
  if (data.NODE_ENV === 'production') {
    const required = [
      ['CLOUDINARY_CLOUD_NAME', 'Cloudinary media storage'],
      ['CLOUDINARY_API_KEY',    'Cloudinary media storage'],
      ['CLOUDINARY_API_SECRET', 'Cloudinary media storage'],
      ['RAZORPAY_KEY_ID',       'Razorpay payment gateway'],
      ['RAZORPAY_KEY_SECRET',   'Razorpay payment gateway'],
      ['RAZORPAY_WEBHOOK_SECRET', 'Razorpay webhook verification'],
    ]
    for (const [key, group] of required) {
      if (!data[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required in production (${group})`,
        })
      }
    }
  }
})

// ── Parse & export ────────────────────────────────────────────────────────────
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n')
  parsed.error.errors.forEach((err) => {
    console.error(`   ${err.path.join('.')}: ${err.message}`)
  })
  console.error('\n💡  Check your .env file against .env.example\n')
  process.exit(1)
}

export const env = parsed.data

// Derived helpers — computed once, used everywhere
export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Parse allowed origins into an array (stored as comma-separated string in env)
export const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
