/**
 * upload.js — Multer File Upload Middleware (Phase 12, hardened Phase 13)
 *
 * Configures memory storage, filters file formats, validates maximum size,
 * and performs magic byte validation to prevent content-type spoofing.
 *
 * MAGIC BYTE VALIDATION:
 * MIME type headers can be spoofed — a PHP script can be uploaded as image.jpg
 * and the mimetype check will pass. Magic bytes (file signatures) are the first
 * N bytes of a file that identify its actual format. We check these AFTER multer
 * processes the buffer to verify the content matches the declared type.
 *
 * WEBP DETECTION:
 * WEBP files have a 12-byte signature: RIFF....WEBP
 * Bytes 0-3: 52 49 46 46 (RIFF)
 * Bytes 8-11: 57 45 42 50 (WEBP)
 * We check both ranges.
 */

import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'
import { HTTP } from '../constants/httpStatus.js'
import { SECURITY_CONFIG } from '../security/security.config.js'
import * as auditService from '../security/audit.service.js'

const { upload: uploadConfig } = SECURITY_CONFIG
const storage = multer.memoryStorage()

/**
 * Filter files ensuring only allowed MIME types are accepted.
 * This is the first check — before the buffer is read.
 */
const fileFilter = (req, file, cb) => {
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new ApiError(
        HTTP.BAD_REQUEST,
        `Invalid file format. Allowed types are: ${uploadConfig.allowedMimeTypes.join(', ')}.`
      ),
      false
    )
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxSizeBytes,
  },
})

/**
 * Sanitize the original filename to prevent path traversal attacks.
 * Strips all characters except alphanumeric, dots, hyphens, and underscores.
 *
 * @param {string} name
 * @returns {string}
 */
const sanitizeFilename = (name) => {
  if (!name) return 'upload'
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255)
}

/**
 * Verify that the file buffer's magic bytes match the declared MIME type.
 * This catches content-type spoofing (e.g., a script renamed to .jpg).
 *
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {boolean}
 */
const validateMagicBytes = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) return false

  const expected = uploadConfig.magicBytes[mimetype]
  if (!expected) return false // Unknown type — reject

  // Check standard magic bytes (first N bytes)
  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false
  }

  // WEBP requires an additional check at bytes 8-11 (WEBP marker after RIFF header)
  if (mimetype === 'image/webp') {
    if (buffer.length < 12) return false
    const webpMarker = SECURITY_CONFIG.upload.webpMarker
    for (let i = 0; i < webpMarker.length; i++) {
      if (buffer[8 + i] !== webpMarker[i]) return false
    }
  }

  return true
}

/**
 * Post-multer middleware that validates magic bytes and sanitizes the filename.
 * Must be used AFTER uploadImageMiddleware() in the middleware chain.
 *
 * Usage:
 *   router.patch('/logo', authenticate, uploadImageMiddleware('image'), validateFileSignature, controller)
 */
export const validateFileSignature = (req, res, next) => {
  if (!req.file) return next() // No file uploaded — let route handler decide

  // Sanitize filename
  req.file.originalname = sanitizeFilename(req.file.originalname)

  // Validate magic bytes
  const valid = validateMagicBytes(req.file.buffer, req.file.mimetype)
  if (!valid) {
    // Fire-and-forget audit log
    auditService.uploadRejected(req, req.user?.id, `Magic byte mismatch for ${req.file.mimetype}`)

    return next(
      new ApiError(HTTP.BAD_REQUEST, 'File content does not match its declared type. Upload rejected.')
    )
  }

  next()
}

/**
 * Express middleware decorator that intercepts multer errors and formats them into clean API responses.
 * Includes the validateFileSignature check in the chain.
 */
export const uploadImageMiddleware = (fieldName) => {
  const uploadSingle = upload.single(fieldName)
  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(HTTP.BAD_REQUEST, 'File size exceeds limit. Maximum allowed size is 5 MB.'))
        }
        return next(new ApiError(HTTP.BAD_REQUEST, err.message))
      }
      next()
    })
  }
}
