import * as favoriteRepo from '../repositories/favorite.repository.js'
import prisma from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

/**
 * Add a restaurant to user's favorites
 */
export const addFavorite = async (userId, restaurantId) => {
  // 1. Verify restaurant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })

  if (!restaurant || !restaurant.isActive || restaurant.deletedAt) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  // 2. Check if already favorited
  const existing = await favoriteRepo.findFavorite(userId, restaurantId)
  if (existing) {
    return { restaurantId, favorited: true } // Return success, idempotent
  }

  // 3. Create favorite
  await favoriteRepo.createFavorite(userId, restaurantId)
  return { restaurantId, favorited: true }
}

/**
 * Remove a restaurant from user's favorites
 */
export const removeFavorite = async (userId, restaurantId) => {
  // 1. Check if favorited
  const existing = await favoriteRepo.findFavorite(userId, restaurantId)
  if (!existing) {
    return { restaurantId, favorited: false } // Return success, idempotent
  }

  // 2. Delete favorite
  await favoriteRepo.deleteFavorite(userId, restaurantId)
  return { restaurantId, favorited: false }
}

/**
 * Get all favorited restaurants for a user
 */
export const getFavorites = async (userId) => {
  const favorites = await favoriteRepo.findFavoritesByUserId(userId)
  
  return favorites.map((fav) => ({
    id: fav.restaurant.id,
    name: fav.restaurant.name,
    slug: fav.restaurant.slug,
    description: fav.restaurant.description,
    image: fav.restaurant.image,
    averageRating: Number(fav.restaurant.averageRating),
    totalReviews: fav.restaurant.totalReviews,
    deliveryFee: Number(fav.restaurant.deliveryFee),
    averageDeliveryTime: fav.restaurant.averageDeliveryTime,
  }))
}
