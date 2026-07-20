import { z } from 'zod'

const addressTypeSchema = z.enum(['HOME', 'WORK', 'HOTEL', 'OTHER'])

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().min(2, 'Label must be at least 2 characters').max(50),
    type: addressTypeSchema.default('HOME'),
    street: z.string().trim().min(3, 'Street address is required').max(255),
    landmark: z.string().trim().max(255).optional().or(z.literal('')),
    city: z.string().trim().min(2, 'City is required').max(100),
    state: z.string().trim().min(2, 'State is required').max(100),
    country: z.string().trim().default('India'),
    postalCode: z.string().trim().regex(/^\d{6}$/, 'Postal code must be exactly 6 digits'),
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    isDefault: z.boolean().optional().default(false),
  }),
})

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid address ID format'),
  }),
  body: z.object({
    label: z.string().trim().min(2, 'Label must be at least 2 characters').max(50).optional(),
    type: addressTypeSchema.optional(),
    street: z.string().trim().min(3, 'Street address is required').max(255).optional(),
    landmark: z.string().trim().max(255).optional().or(z.literal('')),
    city: z.string().trim().min(2, 'City is required').max(100).optional(),
    state: z.string().trim().min(2, 'State is required').max(100).optional(),
    country: z.string().trim().optional(),
    postalCode: z.string().trim().regex(/^\d{6}$/, 'Postal code must be exactly 6 digits').optional(),
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90').optional(),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180').optional(),
    isDefault: z.boolean().optional(),
  }),
})

export const deleteAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid address ID format'),
  }),
})
