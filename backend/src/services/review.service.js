import * as reviewRepo from '../repositories/review.repository.js'
import * as restaurantRepo from '../repositories/restaurant.repository.js'
import * as orderRepo from '../repositories/order.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

/**
 * Submit a rating and review for a completed order
 */
export const createReview = async (userId, orderId, { rating, comment }) => {
  // 1. Fetch order details
  const order = await orderRepo.findOrderById(orderId)
  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  // 2. Validate ownership
  if (order.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  // 3. Verify order status is DELIVERED
  if (order.status !== 'DELIVERED') {
    throw new ApiError(HTTP.BAD_REQUEST, 'You can only review completed orders')
  }

  // 4. Verify no review exists for this order
  const existingReview = await reviewRepo.findReviewByOrderId(orderId)
  if (existingReview) {
    throw new ApiError(HTTP.CONFLICT, MSG.REVIEW_ALREADY_EXISTS)
  }

  // 5. Create the review
  const review = await reviewRepo.createReview({
    userId,
    restaurantId: order.restaurantId,
    orderId,
    rating,
    comment: comment || null,
  })

  // 6. Recalculate and update the restaurant average rating and review count
  const ratingStats = await reviewRepo.getRestaurantRatingStats(order.restaurantId)
  await restaurantRepo.updateRestaurantRating(
    order.restaurantId,
    parseFloat(ratingStats.averageRating.toFixed(2)),
    ratingStats.totalReviews
  )

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }
}

/**
 * Retrieve paginated reviews for a restaurant
 */
export const getRestaurantReviews = async (restaurantId, query) => {
  const { page = 1, limit = 10 } = query
  const skip = (page - 1) * limit

  // Verify restaurant exists
  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(restaurantId)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  const { reviews, total } = await reviewRepo.findReviewsByRestaurantId(restaurant.id, skip, limit)

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}
