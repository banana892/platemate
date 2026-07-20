import { z } from 'zod'

const dayOfWeekEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
])

const coerceNumber = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val.trim() !== '') {
      const num = Number(val)
      return isNaN(num) ? undefined : num
    }
    return val
  },
  z.number().optional()
)

// ── 1. Restaurant Profile Validation ──────────────────────────────────────────

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Restaurant Name must be at least 2 characters').optional(),
    description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
    phone: z.string().trim().regex(/^\+?[1-9]\d{6,14}$/, 'Please provide a valid phone number').optional(),
    email: z.string().trim().toLowerCase().email('Please provide a valid email address').optional(),
    street: z.string().trim().min(3, 'Street must be at least 3 characters').optional(),
    landmark: z.string().trim().max(255).optional().or(z.literal('')),
    city: z.string().trim().min(2, 'City is required').optional(),
    state: z.string().trim().min(2, 'State is required').optional(),
    country: z.string().trim().optional(),
    postalCode: z.string().trim().regex(/^\d{6}$/, 'Postal code must be exactly 6 digits').optional(),
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90').optional(),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180').optional(),
    deliveryRadius: z.number().min(0.1, 'Radius must be at least 100 meters').max(100).optional(),
    deliveryFee: z.number().min(0, 'Delivery fee cannot be negative').optional(),
    minimumOrder: z.number().min(0, 'Minimum order cannot be negative').optional(),
    averageDeliveryTime: z.number().int().min(1, 'Delivery time must be at least 1 minute').optional(),
  }),
})

// ── 2. Restaurant Settings Validation ─────────────────────────────────────────

export const updateSettingsSchema = z.object({
  body: z.object({
    autoAcceptOrders: z.boolean().optional(),
    acceptCashOnDelivery: z.boolean().optional(),
    acceptScheduledOrders: z.boolean().optional(),
    preparationBufferTime: z.number().int().min(0, 'Preparation buffer cannot be negative').optional(),
    estimatedPreparationTime: z.number().int().min(0, 'Estimated preparation time cannot be negative').optional(),
    maxConcurrentOrders: z.number().int().min(1, 'Maximum concurrent orders must be at least 1').optional(),
    defaultPackagingCharge: z.number().min(0, 'Packaging charge cannot be negative').optional(),
    restaurantAnnouncement: z.string().trim().max(1000).optional().nullable(),
    isTemporarilyClosed: z.boolean().optional(),
    temporaryClosureReason: z.string().trim().max(255).optional().nullable(),
    autoPauseWhenBusy: z.boolean().optional(),
  }),
})

// ── 3. Business Hours Validation ──────────────────────────────────────────────

const businessHourItemSchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Open time must be in HH:mm 24h format'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Close time must be in HH:mm 24h format'),
  isClosed: z.boolean(),
})

export const updateBusinessHoursSchema = z.object({
  body: z.object({
    businessHours: z.array(businessHourItemSchema).min(1, 'Please provide business hours to update'),
  }),
})

// ── 4. Menu Categories Validation ─────────────────────────────────────────────

export const categorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Category Name must be at least 2 characters').max(100),
    description: z.string().trim().max(255).optional().or(z.literal('')),
    sortOrder: z.number().int().optional().default(0),
  }),
})

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID format'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Category Name must be at least 2 characters').max(100).optional(),
    description: z.string().trim().max(255).optional().or(z.literal('')),
    sortOrder: z.number().int().optional(),
  }),
})

// ── 5. Menu Items Validation ──────────────────────────────────────────────────

export const menuItemSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Item name must be at least 2 characters').max(100),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    price: z.number().min(0, 'Price cannot be negative'),
    isVeg: z.boolean().optional().default(true),
    isAvailable: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
    categoryId: z.string().uuid('Invalid category ID format'),
  }),
})

export const updateMenuItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid menu item ID format'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Item name must be at least 2 characters').max(100).optional(),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().uuid('Invalid category ID format').optional(),
  }),
})

export const toggleMenuItemAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid menu item ID format'),
  }),
  body: z.object({
    isAvailable: z.boolean(),
  }),
})

// ── 6. Order Status Validation ────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID format'),
  }),
  body: z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ]),
  }),
})

// ── 7. Analytics Filters Validation ───────────────────────────────────────────

export const analyticsFilterSchema = z.object({
  query: z.object({
    range: z.enum(['today', 'week', 'month', 'custom']).default('today'),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
  }).superRefine((val, ctx) => {
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
