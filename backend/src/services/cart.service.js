import * as cartRepo from '../repositories/cart.repository.js'
import prisma from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'

const TAX_PERCENT = 0.05 // 5% GST

/**
 * Format cart details and calculate prices
 */
export const formatCart = (cart) => {
  if (!cart || cart.items.length === 0) {
    return {
      items: [],
      totals: {
        subtotal: 0,
        deliveryFee: 0,
        tax: 0,
        grandTotal: 0,
      },
    }
  }

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + item.quantity * Number(item.menuItem.price)
  }, 0)

  const deliveryFee = Number(cart.restaurant.deliveryFee)
  const tax = subtotal * TAX_PERCENT
  const grandTotal = subtotal + deliveryFee + tax

  return {
    id: cart.id,
    restaurant: {
      id: cart.restaurant.id,
      name: cart.restaurant.name,
      image: cart.restaurant.image,
      deliveryFee,
      minimumOrder: Number(cart.restaurant.minimumOrder),
    },
    items: cart.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      price: Number(item.menuItem.price),
      image: item.menuItem.image,
      quantity: item.quantity,
      totalPrice: item.quantity * Number(item.menuItem.price),
      isVeg: item.menuItem.isVeg,
      isAvailable: item.menuItem.isAvailable,
    })),
    totals: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    },
  }
}

/**
 * Retrieve user's active cart
 */
export const getCart = async (userId) => {
  const cart = await cartRepo.findCartByUserId(userId)
  return formatCart(cart)
}

/**
 * Add a menu item to a user's cart
 */
export const addItemToCart = async (userId, menuItemId, quantity) => {
  // 1. Fetch menu item and check availability
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  })

  if (!menuItem || menuItem.deletedAt) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.MENU_ITEM_NOT_FOUND)
  }

  if (!menuItem.isAvailable) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.MENU_ITEM_UNAVAILABLE)
  }

  // 2. Fetch or create cart
  let cart = await cartRepo.findCartByUserId(userId)

  if (!cart) {
    // Check if the restaurant is active
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: menuItem.restaurantId },
    })
    if (!restaurant || !restaurant.isActive || restaurant.deletedAt) {
      throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
    }

    cart = await cartRepo.createCart(userId, menuItem.restaurantId)
  } else {
    // 3. Verify single restaurant rule
    if (cart.restaurantId !== menuItem.restaurantId) {
      throw new ApiError(HTTP.BAD_REQUEST, MSG.CART_RESTAURANT_CONFLICT)
    }
  }

  // 4. Add or update cart item
  const existingItem = await cartRepo.findCartItemByMenuItemId(cart.id, menuItemId)

  if (existingItem) {
    await cartRepo.updateCartItem(existingItem.id, existingItem.quantity + quantity)
  } else {
    await cartRepo.createCartItem(cart.id, menuItemId, quantity)
  }

  // 5. Return updated cart
  const updatedCart = await cartRepo.findCartByUserId(userId)
  return formatCart(updatedCart)
}

/**
 * Update the quantity of a cart item
 */
export const updateItemQuantity = async (userId, cartItemId, quantity) => {
  const cartItem = await cartRepo.findCartItemById(cartItemId)

  if (!cartItem) {
    throw new ApiError(HTTP.NOT_FOUND, 'Cart item not found')
  }

  // Validate ownership
  if (cartItem.cart.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  if (quantity === 0) {
    // Delete item
    await cartRepo.deleteCartItem(cartItemId)
    
    // Check if cart is now empty
    const remainingItemsCount = await prisma.cartItem.count({
      where: { cartId: cartItem.cartId },
    })

    if (remainingItemsCount === 0) {
      await cartRepo.deleteCart(cartItem.cartId)
    }
  } else {
    // Update quantity
    await cartRepo.updateCartItem(cartItemId, quantity)
  }

  const updatedCart = await cartRepo.findCartByUserId(userId)
  return formatCart(updatedCart)
}

/**
 * Remove an item from the cart
 */
export const removeItemFromCart = async (userId, cartItemId) => {
  return updateItemQuantity(userId, cartItemId, 0)
}

/**
 * Clear the entire cart
 */
export const clearCart = async (userId) => {
  const cart = await cartRepo.findCartByUserId(userId)
  if (cart) {
    await cartRepo.deleteCart(cart.id)
  }
  return formatCart(null)
}
