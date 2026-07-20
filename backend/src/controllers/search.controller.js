import { HTTP } from '../constants/httpStatus.js'
import * as searchService from '../services/search.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const search = asyncHandler(async (req, res) => {
  const { q } = req.query
  const result = await searchService.search(q)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Search results retrieved successfully',
    data: result,
  })
})
