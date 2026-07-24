/**
 * rider.validator.js — Zod Validation Schemas for Rider (Phase 7)
 *
 * Validates all incoming request data for the /rider/* endpoints.
 * Follows the same { body, params, query } schema shape used in
 * partner.validator.js and auth.validator.js.
 *
 * Delivery status state machine (rider-visible):
 *   READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
 */

import { z } from 'zod'

// ── Shared helpers ────────────────────────────────────────────────────────────

const uuidParam = z.string().uuid('Invalid ID format')

// ── 1. Rider Profile Update ────────────────────────────────────────────────────

export const updateRiderProfileSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{6,14}$/, 'Please provide a valid phone number')
      .optional(),
    vehicleType: z.string().trim().min(2, 'Vehicle type must be at least 2 characters').max(50).optional(),
    vehicleNumber: z.string().trim().min(2, 'Vehicle number must be at least 2 characters').max(20).optional(),
    licenseNumber: z.string().trim().min(4, 'License number must be at least 4 characters').max(30).optional(),
    emergencyContact: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{6,14}$/, 'Please provide a valid emergency contact number')
      .optional()
      .nullable(),
  }),
})

// ── 2. Rider Availability Status ─────────────────────────────────────────────

export const updateRiderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ONLINE', 'OFFLINE', 'BUSY', 'ON_BREAK'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be one of: ONLINE, OFFLINE, BUSY, ON_BREAK',
    }),
  }),
})

// ── 3. Delivery Status Update ─────────────────────────────────────────────────

export const updateDeliveryStatusSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
  body: z.object({
    status: z.enum(['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'], {
      required_error: 'Delivery status is required',
      invalid_type_error: 'Status must be one of: READY_FOR_PICKUP, OUT_FOR_DELIVERY, DELIVERED',
    }),
  }),
})

// ── 4. Active Orders List Filters ─────────────────────────────────────────────

export const listActiveOrdersSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 10)),
    status: z
      .enum(['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'])
      .optional(),
    sortBy: z.enum(['createdAt', 'totalAmount']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
})

// ── 5. Delivery History Filters ────────────────────────────────────────────────

export const historyFilterSchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 1)),
      limit: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 10)),
      startDate: z.string().trim().optional(),
      endDate: z.string().trim().optional(),
      search: z.string().trim().optional(),
      sortBy: z.enum(['createdAt', 'totalAmount', 'deliveredAt']).optional().default('createdAt'),
      order: z.enum(['asc', 'desc']).optional().default('desc'),
    })
    .superRefine((val, ctx) => {
      if (val.startDate && isNaN(Date.parse(val.startDate))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'startDate must be a valid date string (YYYY-MM-DD)',
          path: ['startDate'],
        })
      }
      if (val.endDate && isNaN(Date.parse(val.endDate))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'endDate must be a valid date string (YYYY-MM-DD)',
          path: ['endDate'],
        })
      }
    }),
})

// ── 6. Earnings Filters ────────────────────────────────────────────────────────

export const earningsFilterSchema = z.object({
  query: z
    .object({
      range: z.enum(['today', 'week', 'month', 'custom']).optional().default('today'),
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

// ── 7. Analytics Filters ───────────────────────────────────────────────────────

export const analyticsFilterSchema = z.object({
  query: z
    .object({
      range: z.enum(['today', 'week', 'month', 'custom']).optional().default('month'),
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

// ── 8. Notification Single Read ────────────────────────────────────────────────

export const notificationIdSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
})
