import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as cartService from '../services/cart.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.CART_FETCHED,
    data: cart,
  })
})

export const addItem = asyncHandler(async (req, res) => {
  const { menuItemId, quantity } = req.body
  const cart = await cartService.addItemToCart(req.user.id, menuItemId, quantity)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.CART_UPDATED,
    data: cart,
  })
})

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { quantity } = req.body
  const cart = await cartService.updateItemQuantity(req.user.id, id, quantity)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.CART_UPDATED,
    data: cart,
  })
})

export const removeItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const cart = await cartService.removeItemFromCart(req.user.id, id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.CART_UPDATED,
    data: cart,
  })
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.CART_CLEARED,
    data: cart,
  })
})

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body
  // To apply a coupon, we validate the coupon code against the cart's subtotal
  const cart = await cartService.getCart(req.user.id)
  if (!cart || cart.items.length === 0) {
    console.log('🔴 [DEBUG CART_EMPTY - Branch 1: cart.controller.js:applyCoupon]', {
      requestBody: req.body,
      databaseCart: cart,
      cartItems: cart?.items || [],
      validationItems: null,
      validationCartId: null,
      orderItemsData: null,
    })
    return res.status(HTTP.BAD_REQUEST).json({
      success: false,
      message: MSG.CART_EMPTY,
    })
  }

  const { discount, coupon } = await cartService.updateItemQuantity ? 
    // Just fetch it
    await import('../services/coupon.service.js').then((m) => m.validateCoupon(code, cart.totals.subtotal)) : null

  // Recalculate cart totals with discount
  const grandTotal = Math.max(0, cart.totals.subtotal + cart.totals.deliveryFee + cart.totals.tax - discount)

  res.status(HTTP.OK).json({
    success: true,
    message: MSG.COUPON_APPLIED,
    data: {
      ...cart,
      totals: {
        ...cart.totals,
        discount: parseFloat(discount.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
      },
      couponApplied: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount,
      },
    },
  })
})
