/**
 * media.service.js — Media and File Management Service (Phase 12)
 *
 * Implements direct Cloudinary uploads, replacements, deletions, ownership checks,
 * Redis cache updates, and Socket.io event emissions.
 */

import prisma from '../config/db.js'
import { uploadImageBuffer, deleteImage } from '../providers/cloudinary.provider.js'
import { ApiError } from '../utils/ApiError.js'
import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import { emitToRestaurant } from '../socket/socket.events.js'
import { EVENTS } from '../socket/socket.constants.js'

// Cloudinary Folder Constants
export const FOLDERS = {
  USERS_PROFILE: 'users/profile',
  RESTAURANTS_LOGO: 'restaurants/logo',
  RESTAURANTS_BANNER: 'restaurants/banner',
  MENU_ITEMS: 'menu-items',
  PROMO_BANNERS: 'promo-banners',
}

/**
 * Invalidate Redis cache keys for a specific restaurant and its menu.
 */
const invalidateRestaurantCache = async (restaurantId, slug = null) => {
  try {
    const { deleteCache } = await import('../redis/redis.service.js')
    const { CACHE_KEYS } = await import('../redis/cache.constants.js')
    await deleteCache(CACHE_KEYS.RESTAURANT(restaurantId))
    await deleteCache(CACHE_KEYS.MENU(restaurantId))
    if (slug) {
      await deleteCache(CACHE_KEYS.RESTAURANT(slug))
    }
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Validate that a partner owns a specific restaurant.
 */
export const validateRestaurantOwnership = async (userId, restaurantId) => {
  const owner = await prisma.restaurantOwner.findUnique({
    where: { userId },
    include: { restaurants: { select: { id: true } } },
  })

  const ownsRestaurant = owner && owner.restaurants.some((r) => r.id === restaurantId)
  if (!ownsRestaurant) {
    throw new ApiError(HTTP.FORBIDDEN, 'You do not own this restaurant.')
  }
}

/**
 * Validate that a partner owns the restaurant belonging to a specific menu item.
 */
export const validateMenuItemOwnership = async (userId, menuItemId) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId, deletedAt: null },
  })

  if (!menuItem) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.MENU_ITEM_NOT_FOUND)
  }

  await validateRestaurantOwnership(userId, menuItem.restaurantId)
  return menuItem
}

/**
 * Update user profile image.
 */
export const updateProfileImage = async (userId, fileBuffer) => {
  // 1. Upload new image first
  const uploadResult = await uploadImageBuffer(fileBuffer, FOLDERS.USERS_PROFILE)

  // 2. Fetch current record to identify old asset
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicId: true },
  })

  // 3. Update database
  await prisma.user.update({
    where: { id: userId },
    data: {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      avatar: uploadResult.secure_url,
    },
  })

  // 4. Delete old asset from Cloudinary
  if (user && user.publicId) {
    await deleteImage(user.publicId)
  }

  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  }
}

/**
 * Update restaurant logo image.
 */
export const updateRestaurantLogo = async (userId, restaurantId, fileBuffer) => {
  // Ownership check
  await validateRestaurantOwnership(userId, restaurantId)

  // 1. Upload new image
  const uploadResult = await uploadImageBuffer(fileBuffer, FOLDERS.RESTAURANTS_LOGO)

  // 2. Fetch current logo reference
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { publicId: true, slug: true },
  })

  // 3. Update database
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      image: uploadResult.secure_url,
    },
  })

  // 4. Delete old asset
  if (restaurant && restaurant.publicId) {
    await deleteImage(restaurant.publicId)
  }

  // Invalidate Redis caches
  await invalidateRestaurantCache(restaurantId, restaurant?.slug)

  // Emit real-time Socket event
  emitToRestaurant(restaurantId, EVENTS.RESTAURANT_BRANDING_UPDATED, {
    restaurantId,
    logoUrl: uploadResult.secure_url,
  })

  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  }
}

/**
 * Update restaurant banner image.
 */
export const updateRestaurantBanner = async (userId, restaurantId, fileBuffer) => {
  // Ownership check
  await validateRestaurantOwnership(userId, restaurantId)

  // 1. Upload new image
  const uploadResult = await uploadImageBuffer(fileBuffer, FOLDERS.RESTAURANTS_BANNER)

  // 2. Fetch current banner reference
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { bannerPublicId: true, slug: true },
  })

  // 3. Update database
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      bannerUrl: uploadResult.secure_url,
      bannerPublicId: uploadResult.public_id,
    },
  })

  // 4. Delete old asset
  if (restaurant && restaurant.bannerPublicId) {
    await deleteImage(restaurant.bannerPublicId)
  }

  // Invalidate Redis caches
  await invalidateRestaurantCache(restaurantId, restaurant?.slug)

  // Emit real-time Socket event
  emitToRestaurant(restaurantId, EVENTS.RESTAURANT_BRANDING_UPDATED, {
    restaurantId,
    bannerUrl: uploadResult.secure_url,
  })

  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  }
}

/**
 * Update menu item image.
 */
export const updateMenuItemImage = async (userId, menuItemId, fileBuffer) => {
  // Ownership check
  const menuItem = await validateMenuItemOwnership(userId, menuItemId)

  // 1. Upload new image
  const uploadResult = await uploadImageBuffer(fileBuffer, FOLDERS.MENU_ITEMS)

  // 2. Update database
  await prisma.menuItem.update({
    where: { id: menuItemId },
    data: {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      image: uploadResult.secure_url,
    },
  })

  // 3. Delete old asset
  if (menuItem.publicId) {
    await deleteImage(menuItem.publicId)
  }

  // Fetch restaurant slug for cache invalidation
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: menuItem.restaurantId },
    select: { slug: true },
  })

  // Invalidate Redis caches
  await invalidateRestaurantCache(menuItem.restaurantId, restaurant?.slug)

  // Emit real-time Socket event
  emitToRestaurant(menuItem.restaurantId, EVENTS.MENU_ITEMS_UPDATED, {
    restaurantId: menuItem.restaurantId,
    menuItemId,
    imageUrl: uploadResult.secure_url,
  })

  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  }
}

/**
 * General media upload.
 */
export const generalUpload = async (fileBuffer, folder = 'general') => {
  const uploadResult = await uploadImageBuffer(fileBuffer, folder)
  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  }
}

/**
 * General media deletion & database reference cleanup.
 */
export const generalDelete = async (publicId) => {
  if (!publicId) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Public ID is required for deletion.')
  }

  // 1. Delete from Cloudinary (gracefully handles missing assets)
  await deleteImage(publicId)

  // 2. Identify and clear DB references
  const userCheck = await prisma.user.findFirst({ where: { publicId }, select: { id: true } })
  if (userCheck) {
    await prisma.user.update({
      where: { id: userCheck.id },
      data: { imageUrl: null, publicId: null, avatar: null },
    })
  }

  const restLogoCheck = await prisma.restaurant.findFirst({ where: { publicId }, select: { id: true, slug: true } })
  if (restLogoCheck) {
    await prisma.restaurant.update({
      where: { id: restLogoCheck.id },
      data: { imageUrl: null, publicId: null, image: null },
    })
    await invalidateRestaurantCache(restLogoCheck.id, restLogoCheck.slug)
  }

  const restBannerCheck = await prisma.restaurant.findFirst({ where: { bannerPublicId: publicId }, select: { id: true, slug: true } })
  if (restBannerCheck) {
    await prisma.restaurant.update({
      where: { id: restBannerCheck.id },
      data: { bannerUrl: null, bannerPublicId: null },
    })
    await invalidateRestaurantCache(restBannerCheck.id, restBannerCheck.slug)
  }

  const itemCheck = await prisma.menuItem.findFirst({ where: { publicId }, select: { id: true, restaurantId: true } })
  if (itemCheck) {
    await prisma.menuItem.update({
      where: { id: itemCheck.id },
      data: { imageUrl: null, publicId: null, image: null },
    })
    const rest = await prisma.restaurant.findUnique({ where: { id: itemCheck.restaurantId }, select: { slug: true } })
    await invalidateRestaurantCache(itemCheck.restaurantId, rest?.slug)
  }

  const cuisineCheck = await prisma.cuisine.findFirst({ where: { publicId }, select: { id: true } })
  if (cuisineCheck) {
    await prisma.cuisine.update({
      where: { id: cuisineCheck.id },
      data: { imageUrl: null, publicId: null, image: null },
    })
    // Invalidate cuisines cache prefix
    try {
      const { deleteCache } = await import('../redis/redis.service.js')
      const { CACHE_KEYS } = await import('../redis/cache.constants.js')
      await deleteCache(CACHE_KEYS.CUISINES)
    } catch {}
  }

  const bannerCheck = await prisma.promoBanner.findFirst({ where: { publicId }, select: { id: true } })
  if (bannerCheck) {
    await prisma.promoBanner.delete({ where: { id: bannerCheck.id } })
  }

  return { publicId, deleted: true }
}
