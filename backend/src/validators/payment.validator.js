/**
 * payment.validator.js — Zod validation schemas for Payment System (Phase 10)
 *
 * Validates payloads and queries for payment initialization, verification, refunds, and queries.
 */

import { z } from 'zod'

const uuidParam = z.string().uuid('Invalid ID format')

// Reusable pagination schema
const baseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20)),
  sortBy: z.string().trim().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ── 1. Create Payment Order ──────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID reference'),
    method: z.enum(['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'COD'], {
      required_error: 'Payment method is required',
    }),
  }),
})

// ── 2. Verify Payment ────────────────────────────────────────────────────────

export const verifyPaymentSchema = z.object({
  body: z.object({
    providerPaymentId: z.string().trim().min(5, 'Invalid provider payment ID'),
    providerOrderId: z.string().trim().min(5, 'Invalid provider order ID'),
    providerSignature: z.string().trim().min(10, 'Invalid provider signature'),
  }),
})

// ── 3. Refund Request ────────────────────────────────────────────────────────

export const refundSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
  body: z.object({
    amount: z.number().positive('Refund amount must be greater than zero').optional(),
    reason: z
      .string()
      .trim()
      .min(4, 'Refund reason must be at least 4 characters')
      .max(255)
      .optional()
      .default('Customer requested refund'),
  }),
})

// ── 4. Payment History Filters ───────────────────────────────────────────────

export const paymentHistoryFiltersSchema = z.object({
  query: baseQuerySchema.extend({
    status: z.enum(['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
    provider: z.enum(['RAZORPAY', 'STRIPE', 'COD']).optional(),
  }),
})

// ── 5. Payment Analytics Filters ──────────────────────────────────────────────

export const paymentAnalyticsFiltersSchema = z.object({
  query: z
    .object({
      range: z.enum(['today', 'week', 'month', 'year', 'custom']).optional().default('month'),
      startDate: z.string().trim().optional(),
      endDate: z.string().trim().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.range === 'custom') {
        if (!val.startDate || !val.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Both startDate and endDate are required for custom range',
          })
        }
      }
    }),
})

// ── 6. Id Param Validation ───────────────────────────────────────────────────

export const idParamSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
})
