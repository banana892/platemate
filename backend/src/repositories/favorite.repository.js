import prisma from '../config/db.js'

/**
 * Find a favorite relationship between a user and a restaurant
 */
export const findFavorite = async (userId, restaurantId) => {
  return prisma.favorite.findUnique({
    where: {
      uq_favorite_user_restaurant: {
        userId,
        restaurantId,
      },
    },
  })
}

/**
 * Retrieve all favorites of a user including restaurant details
 */
export const findFavoritesByUserId = async (userId) => {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          averageRating: true,
          totalReviews: true,
          deliveryFee: true,
          averageDeliveryTime: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Create a favorite entry
 */
export const createFavorite = async (userId, restaurantId) => {
  return prisma.favorite.create({
    data: {
      userId,
      restaurantId,
    },
  })
}

/**
 * Delete a favorite entry
 */
export const deleteFavorite = async (userId, restaurantId) => {
  return prisma.favorite.delete({
    where: {
      uq_favorite_user_restaurant: {
        userId,
        restaurantId,
      },
    },
  })
}
