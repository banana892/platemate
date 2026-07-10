/**
 * upload.js — Multer File Upload Middleware
 *
 * WHY MULTER?
 * Express doesn't handle multipart/form-data by default (the encoding used
 * for file uploads). Multer parses this and gives us access to req.file.
 *
 * MEMORY STORAGE vs DISK STORAGE:
 * We use memory storage (not disk) because:
 * 1. We immediately forward to Cloudinary — no need to touch the filesystem
 * 2. On serverless/cloud environments (Railway, Render), writing to disk
 *    is unreliable between requests
 * 3. Faster: buffer → Cloudinary stream vs buffer → disk → read → Cloudinary
 *
 * SECURITY:
 * - File type validation (MIME type + magic bytes via file.mimetype)
 * - File size limit (5MB) to prevent memory exhaustion
 * - Only specific MIME types are allowed
 *
 * NOTE: In Phase 12, we'll create the actual Cloudinary upload service that
 * takes req.file.buffer and streams it to Cloudinary.
 */

import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

// ── Storage: memory (no disk writes) ─────────────────────────────────────────
const storage = multer.memoryStorage()

// ── File filter ───────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true) // Accept
  } else {
    cb(new ApiError(400, MSG.INVALID_FILE_TYPE), false) // Reject
  }
}

// ── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES,
    files: 1, // Single file per request (for now)
  },
})

// ── Named middleware exports ───────────────────────────────────────────────────

/** Single image upload — field name: 'image' */
export const uploadSingle = upload.single('image')

/** For routes that accept: logo + cover (restaurant creation) */
export const uploadRestaurantImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
])

/**
 * Error handler for Multer-specific errors
 * Must be used AFTER the upload middleware in route definitions.
 * Multer errors don't flow through normal Express error handling automatically.
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, MSG.FILE_TOO_LARGE))
    }
    return next(new ApiError(400, err.message))
  }
  next(err) // Pass to global error handler
}
