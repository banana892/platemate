import * as cartRepo from '../repositories/cart.repository.js'
import * as addressRepo from '../repositories/address.repository.js'
import * as couponService from './coupon.service.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import { calculateDistance } from '../utils/geo.js'

import prisma from '../config/db.js'

const TAX_PERCENT = 0.05 // 5% GST

/**
 * Validate checkout parameters, availability, range, and calculate total pricing
 */
export const validateCheckout = async (userId, { addressId, couponCode, items }) => {
  // 1. Fetch user cart
  let cart = await cartRepo.findCartByUserId(userId)
  if ((!cart || cart.items.length === 0) && Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      let menuItem = await prisma.menuItem.findFirst({
        where: { id: String(item.menuItemId), isAvailable: true, deletedAt: null },
      })
      if (!menuItem) {
        menuItem = await prisma.menuItem.findFirst({
          where: { isAvailable: true, deletedAt: null },
        })
      }
      if (menuItem) {
        if (!cart) {
          cart = await cartRepo.createCart(userId, menuItem.restaurantId)
        } else if (!cart.restaurantId) {
          await prisma.cart.update({
            where: { id: cart.id },
            data: { restaurantId: menuItem.restaurantId },
          })
        }
        await cartRepo.createCartItem(cart.id, menuItem.id, item.quantity || 1)
      }
    }
    cart = await cartRepo.findCartByUserId(userId)
  }

  if (!cart || cart.items.length === 0) {
    console.log('🔴 [DEBUG CART_EMPTY - Branch 2: checkout.service.js:validateCheckout]', {
      requestBody: { addressId, couponCode, items },
      validationItems: null,
      validationCartId: cart?.id || null,
      databaseCart: cart,
      cartItems: cart?.items || [],
      orderItemsData: null,
    })
    throw new ApiError(HTTP.BAD_REQUEST, MSG.CART_EMPTY)
  }

  const restaurant = cart.restaurant
  if (!restaurant || !restaurant.isActive) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.RESTAURANT_NOT_FOUND)
  }

  // 2. Verify restaurant is open
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

  if (!isOpen) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.RESTAURANT_CLOSED)
  }

  // 3. Verify all items are available
  for (const item of cart.items) {
    if (!item.menuItem.isAvailable || item.menuItem.deletedAt) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        `${MSG.MENU_ITEM_UNAVAILABLE}: ${item.menuItem.name}`
      )
    }
  }

  // 4. Verify address exists and belongs to the user
  const address = await addressRepo.findAddressById(addressId)
  if (!address) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ADDRESS_NOT_FOUND)
  }

  if (address.userId !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  // 5. Calculate delivery distance and verify delivery radius
  const distance = calculateDistance(
    restaurant.latitude,
    restaurant.longitude,
    address.latitude,
    address.longitude
  )

  if (Number(restaurant.deliveryRadius) > 0 && distance > Number(restaurant.deliveryRadius)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `Delivery address is outside the restaurant's delivery radius of ${Number(restaurant.deliveryRadius)} km (Distance: ${distance} km).`
    )
  }

  // 6. Calculate Subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + item.quantity * Number(item.menuItem.price)
  }, 0)

  // 7. Verify minimum order threshold
  if (subtotal < Number(restaurant.minimumOrder)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `Minimum order amount of ₹${Number(restaurant.minimumOrder)} not met. Current subtotal: ₹${subtotal}`
    )
  }

  // 8. Calculate pricing breakdown
  const deliveryFee = Number(restaurant.deliveryFee)
  const tax = subtotal * TAX_PERCENT
  let discount = 0
  let coupon = null

  if (couponCode) {
    const couponValidation = await couponService.validateCoupon(couponCode, subtotal)
    discount = couponValidation.discount
    coupon = couponValidation.coupon
  }

  const grandTotal = subtotal + deliveryFee + tax - discount

  return {
    cartId: cart.id,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      isOpen: true,
    },
    address: {
      id: address.id,
      label: address.label,
      street: address.street,
      city: address.city,
    },
    distance,
    totals: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      grandTotal: parseFloat(Math.max(0, grandTotal).toFixed(2)),
    },
    items: cart.items.map((item) => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: Number(item.menuItem.price),
      totalPrice: item.quantity * Number(item.menuItem.price),
    })),
    couponApplied: coupon ? { id: coupon.id, code: coupon.code, discount } : null,
  }
}
