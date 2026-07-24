/**
 * admin.validator.js — Zod Validation Schemas for Admin (Phase 8)
 *
 * Validates all incoming request data for the /admin/* endpoints.
 */

import { z } from 'zod'

const uuidParam = z.string().uuid('Invalid ID format')

// Reusable pagination and sorting query schema
const baseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20)),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ── 1. Customer Filters & Status ─────────────────────────────────────────────

export const customerFiltersSchema = z.object({
  query: baseQuerySchema.extend({
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    role: z.enum(['CUSTOMER', 'PARTNER', 'RIDER', 'ADMIN']).optional(),
  }),
})

export const customerStatusSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
  body: z.object({
    status: z.enum(['activate', 'suspend', 'deactivate'], {
      required_error: 'Status action is required',
    }),
  }),
})

// ── 2. Restaurant Filters ───────────────────────────────────────────────────

export const restaurantFiltersSchema = z.object({
  query: baseQuerySchema.extend({
    city: z.string().trim().optional(),
    isApproved: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  }),
})

// ── 3. Rider Filters ─────────────────────────────────────────────────────────

export const riderFiltersSchema = z.object({
  query: baseQuerySchema.extend({
    isApproved: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    isAvailable: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  }),
})

// ── 4. Order Filters & Cancellation ──────────────────────────────────────────

export const orderFiltersSchema = z.object({
  query: baseQuerySchema.extend({
    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ])
      .optional(),
    restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
    customerId: z.string().uuid('Invalid customer ID').optional(),
    riderId: z.string().uuid('Invalid rider ID').optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
  }).superRefine((val, ctx) => {
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

export const cancelOrderSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(4, 'Cancellation reason must be at least 4 characters')
      .max(255, 'Reason is too long'),
  }),
})

// ── 5. Review Moderation Filters ────────────────────────────────────────────

export const reviewFiltersSchema = z.object({
  query: baseQuerySchema.extend({
    restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
    rating: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined)),
    isHidden: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  }),
})

// ── 6. Coupon Management ────────────────────────────────────────────────────

export const couponCreateSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .trim()
        .min(3, 'Coupon code must be at least 3 characters')
        .max(20)
        .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be alphanumeric with no spaces'),
      description: z.string().trim().max(255).optional(),
      discountPercent: z.number().min(1).max(100).optional(),
      discountAmount: z.number().min(1).optional(),
      maxDiscount: z.number().min(0).optional().nullable(),
      minimumOrder: z.number().min(0).default(0),
      usageLimit: z.number().int().min(1).optional().nullable(),
      validFrom: z.string().datetime({ message: 'validFrom must be an ISO timestamp' }),
      validUntil: z.string().datetime({ message: 'validUntil must be an ISO timestamp' }),
      isActive: z.boolean().default(true),
    })
    .superRefine((val, ctx) => {
      // Must specify either percent or flat amount but not both or none
      if (!val.discountPercent && !val.discountAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Either discountPercent or discountAmount must be specified',
          path: ['discountPercent'],
        })
      }
      if (val.discountPercent && val.discountAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cannot specify both percentage and flat discount values',
          path: ['discountPercent'],
        })
      }
      // Date order validation
      if (new Date(val.validFrom) >= new Date(val.validUntil)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validUntil must be after validFrom date',
          path: ['validUntil'],
        })
      }
    }),
})

export const couponUpdateSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
  body: z
    .object({
      code: z.string().trim().min(3).max(20).regex(/^[A-Z0-9_-]+$/).optional(),
      description: z.string().trim().max(255).optional(),
      discountPercent: z.number().min(1).max(100).optional().nullable(),
      discountAmount: z.number().min(1).optional().nullable(),
      maxDiscount: z.number().min(0).optional().nullable(),
      minimumOrder: z.number().min(0).optional(),
      usageLimit: z.number().int().min(1).optional().nullable(),
      validFrom: z.string().datetime().optional(),
      validUntil: z.string().datetime().optional(),
      isActive: z.boolean().optional(),
    })
    .superRefine((val, ctx) => {
      // Date order validation if both dates are provided in update
      if (val.validFrom && val.validUntil && new Date(val.validFrom) >= new Date(val.validUntil)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validUntil must be after validFrom date',
          path: ['validUntil'],
        })
      }
    }),
})

// ── 7. Category (Cuisine) Management ────────────────────────────────────────

export const cuisineCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    image: z.string().url('Invalid image URL').optional().nullable(),
  }),
})

export const cuisineUpdateSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
  body: z.object({
    name: z.string().trim().min(2).max(50).optional(),
    image: z.string().url().optional().nullable(),
  }),
})

// ── 8. Analytics Filters ─────────────────────────────────────────────────────

export const analyticsFiltersSchema = z.object({
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

// ── 9. Notifications Broadcast ───────────────────────────────────────────────

export const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100),
    message: z.string().trim().min(5, 'Message must be at least 5 characters').max(500),
    type: z.enum(['SYSTEM', 'PROMO', 'ORDER']).default('SYSTEM'),
    target: z.enum(['ALL', 'CUSTOMER', 'PARTNER', 'RIDER']),
  }),
})

// ── 10. Platform Settings ───────────────────────────────────────────────────

export const platformSettingsSchema = z.object({
  body: z.object({
    platformName: z.string().trim().min(2).max(50).optional(),
    platformFeePercent: z.number().min(0).max(100).optional(),
    defaultDeliveryFee: z.number().min(0).optional(),
    supportEmail: z.string().trim().email('Invalid email address').optional(),
    supportPhone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{6,14}$/, 'Please provide a valid support phone number')
      .optional(),
    maintenanceMode: z.boolean().optional(),
    termsUrl: z.string().url().optional().nullable(),
    privacyUrl: z.string().url().optional().nullable(),
  }),
})

// ── 11. Generic ID param schema ──────────────────────────────────────────────

export const idParamSchema = z.object({
  params: z.object({
    id: uuidParam,
  }),
})

// ── 12. Audit Log Query Schema (Phase 13) ────────────────────────────────────

export const auditLogQuerySchema = z.object({
  query: baseQuerySchema.extend({
    userId: z.string().uuid('Invalid user ID').optional(),
    action: z
      .enum([
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'LOGOUT',
        'PASSWORD_CHANGED',
        'ACCOUNT_LOCKED',
        'TOKEN_REVOKED',
        'ADMIN_ACTION',
        'SUSPICIOUS_ACTIVITY',
        'RATE_LIMIT_EXCEEDED',
        'UPLOAD_REJECTED',
        'PERMISSION_DENIED',
      ])
      .optional(),
    severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
    from: z.string().datetime({ message: 'from must be a valid ISO date string' }).optional(),
    to: z.string().datetime({ message: 'to must be a valid ISO date string' }).optional(),
  }),
})

