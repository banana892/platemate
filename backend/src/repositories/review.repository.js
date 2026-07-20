import prisma from '../config/db.js'

/**
 * Find a review by Order ID (to check if already reviewed)
 */
export const findReviewByOrderId = async (orderId) => {
  return prisma.review.findUnique({
    where: { orderId },
  })
}

/**
 * Retrieve paginated reviews for a restaurant
 */
export const findReviewsByRestaurantId = async (restaurantId, skip = 0, take = 10) => {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.review.count({
      where: { restaurantId },
    }),
  ])

  return { reviews, total }
}

/**
 * Create a new review and return it
 */
export const createReview = async (data) => {
  return prisma.review.create({
    data,
  })
}

/**
 * Calculate the average rating and review count for a restaurant
 */
export const getRestaurantRatingStats = async (restaurantId) => {
  const stats = await prisma.review.aggregate({
    where: { restaurantId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  })

  return {
    averageRating: stats._avg.rating || 0,
    totalReviews: stats._count.rating || 0,
  }
}
