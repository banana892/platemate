import prisma from '../config/db.js'

/**
 * Fetch a user's active cart including items, menu items, and restaurant details
 */
export const findCartByUserId = async (userId) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          image: true,
          minimumOrder: true,
          deliveryFee: true,
          isActive: true,
          latitude: true,
          longitude: true,
          deliveryRadius: true,
          businessHours: true,
        },
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              isVeg: true,
              isAvailable: true,
              deletedAt: true,
              restaurantId: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

/**
 * Find a specific cart item by ID (includes cart to verify ownership)
 */
export const findCartItemById = async (cartItemId) => {
  return prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
    },
  })
}

/**
 * Find a specific cart item by cart ID and menu item ID
 */
export const findCartItemByMenuItemId = async (cartId, menuItemId) => {
  return prisma.cartItem.findUnique({
    where: {
      uq_cart_item: {
        cartId,
        menuItemId,
      },
    },
  })
}

/**
 * Create a new cart for a user associated with a restaurant
 */
export const createCart = async (userId, restaurantId) => {
  return prisma.cart.create({
    data: {
      userId,
      restaurantId,
    },
  })
}

/**
 * Delete a user's cart (cascade deletes items)
 */
export const deleteCart = async (cartId) => {
  return prisma.cart.delete({
    where: { id: cartId },
  })
}

/**
 * Add a new item to a cart
 */
export const createCartItem = async (cartId, menuItemId, quantity) => {
  return prisma.cartItem.create({
    data: {
      cartId,
      menuItemId,
      quantity,
    },
  })
}

/**
 * Update quantity of an existing cart item
 */
export const updateCartItem = async (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  })
}

/**
 * Delete a cart item
 */
export const deleteCartItem = async (cartItemId) => {
  return prisma.cartItem.delete({
    where: { id: cartItemId },
  })
}
