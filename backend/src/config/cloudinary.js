/**
 * cloudinary.js — Cloudinary SDK Configuration
 *
 * Cloudinary is configured once here and imported wherever needed.
 * We use the v2 API which has a cleaner promise-based interface.
 *
 * The upload_preset and folder naming strategy:
 *   platemate/avatars/      — user profile pictures
 *   platemate/restaurants/  — restaurant logos and covers
 *   platemate/menu/         — menu item photos
 *
 * Using folders makes it easy to apply transformations per-type
 * and manage storage/billing.
 */

import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'
import logger from './logger.js'

// Only configure if credentials are provided
// (allows running without Cloudinary in early development)
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS for image URLs
  })
  logger.info('Cloudinary: configured')
} else {
  logger.warn('Cloudinary: credentials not set — image uploads disabled')
}

export default cloudinary

// ── Folder constants ───────────────────────────────────────────────────────────
// Centralizing folder paths prevents typos across the codebase
export const CLOUDINARY_FOLDERS = {
  AVATARS: 'platemate/avatars',
  RESTAURANT_LOGOS: 'platemate/restaurants/logos',
  RESTAURANT_COVERS: 'platemate/restaurants/covers',
  MENU_ITEMS: 'platemate/menu',
}
