import prisma from '../config/db.js'

/**
 * Perform full-text search across Cuisines, Restaurants, and MenuItems in parallel.
 */
export const search = async (queryText) => {
  const q = queryText.trim()

  const [restaurants, menuItems, cuisines] = await Promise.all([
    // 1. Search active restaurants
    prisma.restaurant.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          {
            cuisines: {
              some: {
                cuisine: {
                  name: { contains: q, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        averageRating: true,
        averageDeliveryTime: true,
      },
      take: 5,
    }),

    // 2. Search available menu items
    prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        isVeg: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    }),

    // 3. Search cuisines
    prisma.cuisine.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 5,
    }),
  ])

  return {
    restaurants: restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      image: r.image,
      averageRating: Number(r.averageRating),
      averageDeliveryTime: r.averageDeliveryTime,
    })),
    menuItems: menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: Number(item.price),
      image: item.image,
      isVeg: item.isVeg,
      restaurant: {
        id: item.restaurant.id,
        name: item.restaurant.name,
      },
    })),
    cuisines: cuisines.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
    })),
  }
}
