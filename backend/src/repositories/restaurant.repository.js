import prisma from '../config/db.js'

/**
 * Fetch list of active restaurants with filters, sorting, and pagination
 */
export const findRestaurants = async ({
  where = {},
  orderBy = {},
  skip = 0,
  take = 10,
}) => {
  // Always restrict to active and non-deleted restaurants
  const cleanWhere = {
    ...where,
    isActive: true,
    deletedAt: null,
  }

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where: cleanWhere,
      orderBy,
      skip,
      take,
      include: {
        cuisines: {
          include: {
            cuisine: true,
          },
        },
      },
    }),
    prisma.restaurant.count({ where: cleanWhere }),
  ])

  return { restaurants, total }
}

/**
 * Find active restaurant by ID or slug
 */
export const findRestaurantByIdOrSlug = async (idOrSlug) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

  return prisma.restaurant.findFirst({
    where: {
      isActive: true,
      deletedAt: null,
      ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }),
    },
    include: {
      businessHours: true,
      cuisines: {
        include: {
          cuisine: true,
        },
      },
      categories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          menuItems: {
            where: {
              isAvailable: true,
              deletedAt: null,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })
}

/**
 * Find menu items for a restaurant with filters
 */
export const findMenuItems = async (restaurantId, { veg, search } = {}) => {
  const where = {
    restaurantId,
    isAvailable: true,
    deletedAt: null,
  }

  if (veg !== undefined) {
    where.isVeg = veg
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  return prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: 'asc' },
    include: {
      menuItems: {
        where,
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

/**
 * Update restaurant rating statistics
 */
export const updateRestaurantRating = async (restaurantId, averageRating, totalReviews) => {
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      averageRating,
      totalReviews,
    },
  })
}
