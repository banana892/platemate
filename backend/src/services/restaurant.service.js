import * as restaurantRepo from '../repositories/restaurant.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import { calculateDistance } from '../utils/geo.js'

/**
 * List restaurants with sorting, pagination, search, and geo distance calculations.
 */
export const listRestaurants = async (query) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search,
    cuisines,
    veg,
    rating,
    minPrice,
    maxPrice,
    deliveryTime,
    openNow,
    latitude,
    longitude,
  } = query

  const where = {}

  // 1. Full-text search on Name and Description
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // 2. Cuisine filtering (comma-separated names)
  if (cuisines) {
    const cuisineList = cuisines.split(',').map((c) => c.trim()).filter(Boolean)
    if (cuisineList.length > 0) {
      where.cuisines = {
        some: {
          cuisine: {
            name: {
              in: cuisineList,
              mode: 'insensitive',
            },
          },
        },
      }
    }
  }

  // 3. Veg option filter: restaurant must have at least one veg item
  if (veg === true) {
    where.menuItems = {
      some: {
        isVeg: true,
        isAvailable: true,
        deletedAt: null,
      },
    }
  }

  // 4. Rating filter: averageRating >= rating
  if (rating !== undefined) {
    where.averageRating = { gte: rating }
  }

  // 5. Price range filter: has menu items in the price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter = {}
    if (minPrice !== undefined) priceFilter.gte = minPrice
    if (maxPrice !== undefined) priceFilter.lte = maxPrice

    where.menuItems = {
      some: {
        price: priceFilter,
        isAvailable: true,
        deletedAt: null,
      },
    }
  }

  // 6. Max Delivery time filter
  if (deliveryTime !== undefined) {
    where.averageDeliveryTime = { lte: deliveryTime }
  }

  // 7. Open Now filter
  if (openNow === true) {
    const date = new Date()
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const dayOfWeek = days[date.getDay()]
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const currentTime = `${hours}:${minutes}`

    where.businessHours = {
      some: {
        dayOfWeek,
        isClosed: false,
        openTime: { lte: currentTime },
        closeTime: { gte: currentTime },
      },
    }
  }

  // 8. Sorting translation
  let orderBy = {}
  if (sortBy === 'rating') {
    orderBy = { averageRating: order }
  } else if (sortBy === 'deliveryTime') {
    orderBy = { averageDeliveryTime: order }
  } else if (sortBy === 'deliveryFee') {
    orderBy = { deliveryFee: order }
  } else if (sortBy === 'minimumOrder') {
    orderBy = { minimumOrder: order }
  } else if (sortBy === 'name') {
    orderBy = { name: order }
  } else {
    orderBy = { createdAt: order }
  }

  const skip = (page - 1) * limit
  const take = limit

  const { restaurants, total } = await restaurantRepo.findRestaurants({
    where,
    orderBy,
    skip,
    take,
  })

  // 9. Map list to add distance (actual or mock) and formatted details
  const data = restaurants.map((restaurant) => {
    let distance = null
    if (latitude !== undefined && longitude !== undefined) {
      distance = calculateDistance(latitude, longitude, restaurant.latitude, restaurant.longitude)
    } else {
      // Default fallback mock distance (e.g. 1.5km to 4.5km)
      distance = parseFloat((1.5 + (restaurant.name.length % 4) * 0.75).toFixed(2))
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      image: restaurant.image,
      phone: restaurant.phone,
      email: restaurant.email,
      street: restaurant.street,
      city: restaurant.city,
      averageRating: Number(restaurant.averageRating),
      totalReviews: restaurant.totalReviews,
      deliveryFee: Number(restaurant.deliveryFee),
      averageDeliveryTime: restaurant.averageDeliveryTime,
      minimumOrder: Number(restaurant.minimumOrder),
      distance,
      cuisines: restaurant.cuisines.map((c) => c.cuisine.name),
    }
  })

  return {
    restaurants: data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Retrieve detailed restaurant by ID or slug
 */
export const getRestaurant = async (idOrSlug) => {
  const { getCache, setCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS, CACHE_TTLS } = await import('../redis/cache.constants.js')

  const cacheKey = CACHE_KEYS.RESTAURANT(idOrSlug)
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(idOrSlug)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  // Format business hours
  const businessHours = restaurant.businessHours.map((bh) => ({
    dayOfWeek: bh.dayOfWeek,
    openTime: bh.openTime,
    closeTime: bh.closeTime,
    isClosed: bh.isClosed,
  }))

  // Format grouped menu categories
  const categories = restaurant.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    menuItems: cat.menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: Number(item.price),
      image: item.image,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
    })),
  }))

  // Form check for open status
  const date = new Date()
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const dayOfWeek = days[date.getDay()]
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const currentTime = `${hours}:${minutes}`

  const todaysHours = restaurant.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek)
  const isOpen = todaysHours
    ? !todaysHours.isClosed && currentTime >= todaysHours.openTime && currentTime <= todaysHours.closeTime
    : false

  const result = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    image: restaurant.image,
    phone: restaurant.phone,
    email: restaurant.email,
    street: restaurant.street,
    city: restaurant.city,
    state: restaurant.state,
    postalCode: restaurant.postalCode,
    latitude: Number(restaurant.latitude),
    longitude: Number(restaurant.longitude),
    deliveryRadius: Number(restaurant.deliveryRadius),
    minimumOrder: Number(restaurant.minimumOrder),
    deliveryFee: Number(restaurant.deliveryFee),
    averageDeliveryTime: restaurant.averageDeliveryTime,
    averageRating: Number(restaurant.averageRating),
    totalReviews: restaurant.totalReviews,
    isOpen,
    businessHours,
    categories,
  }

  await setCache(cacheKey, result, CACHE_TTLS.RESTAURANT)
  return result
}

/**
 * Retrieve menu items of a restaurant
 */
export const getMenu = async (idOrSlug, filters = {}) => {
  const { getCache, setCache } = await import('../redis/redis.service.js')
  const { CACHE_KEYS, CACHE_TTLS } = await import('../redis/cache.constants.js')

  const restaurant = await restaurantRepo.findRestaurantByIdOrSlug(idOrSlug)
  if (!restaurant) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  const hasFilters = Object.keys(filters).length > 0
  const cacheKey = CACHE_KEYS.MENU(restaurant.id)

  if (!hasFilters) {
    const cached = await getCache(cacheKey)
    if (cached) return cached
  }

  const menu = await restaurantRepo.findMenuItems(restaurant.id, filters)
  const result = menu
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: Number(item.price),
        image: item.image,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
      })),
    }))
    .filter((cat) => cat.menuItems.length > 0) // Only return categories that have matched items

  if (!hasFilters) {
    await setCache(cacheKey, result, CACHE_TTLS.MENU)
  }

  return result
}
