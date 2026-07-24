import { z } from 'zod'

const addressTypeSchema = z.enum(['HOME', 'WORK', 'HOTEL', 'OTHER'])

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().min(2, 'Label must be at least 2 characters').max(50),
    type: addressTypeSchema.optional().default('HOME'),
    recipientName: z.string().trim().min(2, 'Recipient name is required').max(100).optional().or(z.literal('')),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, 'Invalid phone number format').optional().or(z.literal('')),
    houseNumber: z.string().trim().max(100).optional().or(z.literal('')),
    formattedAddress: z.string().trim().max(500).optional().or(z.literal('')),
    street: z.string().trim().max(255).optional().or(z.literal('')),
    landmark: z.string().trim().max(255).optional().or(z.literal('')),
    city: z.string().trim().min(2, 'City is required').max(100),
    state: z.string().trim().min(2, 'State is required').max(100),
    country: z.string().trim().default('India'),
    postalCode: z.string().trim().regex(/^\d{6}$/, 'Postal code must be exactly 6 digits'),
    latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
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
    recipientName: z.string().trim().min(2).max(100).optional().or(z.literal('')),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, 'Invalid phone number format').optional().or(z.literal('')),
    houseNumber: z.string().trim().max(100).optional().or(z.literal('')),
    formattedAddress: z.string().trim().max(500).optional().or(z.literal('')),
    street: z.string().trim().max(255).optional().or(z.literal('')),
    landmark: z.string().trim().max(255).optional().or(z.literal('')),
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    country: z.string().trim().optional(),
    postalCode: z.string().trim().regex(/^\d{6}$/, 'Postal code must be exactly 6 digits').optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isDefault: z.boolean().optional(),
  }),
})

export const getAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid address ID format'),
  }),
})

export const deleteAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid address ID format'),
  }),
})

export const setDefaultAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid address ID format'),
  }),
})

