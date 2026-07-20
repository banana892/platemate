import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as reviewService from '../services/review.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const createReview = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params
  const review = await reviewService.createReview(req.user.id, orderId, req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: MSG.REVIEW_CREATED,
    data: review,
  })
})
