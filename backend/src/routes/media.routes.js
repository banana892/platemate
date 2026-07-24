/**
 * media.routes.js — General Media Upload & Deletion Routes (Phase 12)
 */

import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { uploadImageMiddleware } from '../middleware/upload.js'
import * as mediaController from '../controllers/media.controller.js'

const router = Router()

// All media upload and delete routes require authentication
router.use(authenticate)

router.post('/upload', uploadImageMiddleware('file'), mediaController.uploadMedia)

// Wildcard parameter :publicId(*) captures slash segments in Cloudinary public IDs (e.g. folder/subfolder/file_name)
router.delete('/:publicId(*)', mediaController.deleteMedia)

export default router
