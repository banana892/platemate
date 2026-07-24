/**
 * media.controller.js — Media File Management Controllers (Phase 12)
 */

import * as mediaService from '../services/media.service.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { HTTP } from '../constants/httpStatus.js'
import asyncHandler from '../middleware/asyncHandler.js'

/**
 * Handle general file upload to Cloudinary.
 */
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP.BAD_REQUEST, 'No file provided for upload.')
  }

  const { folder } = req.query
  const data = await mediaService.generalUpload(req.file.buffer, folder)

  res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, 'Media uploaded successfully.', data)
  )
})

/**
 * Handle general media asset deletion.
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { publicId } = req.params

  if (!publicId) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Public ID parameter is required.')
  }

  await mediaService.generalDelete(publicId)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, 'Media asset deleted successfully.')
  )
})
