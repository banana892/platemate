import * as orderRepo from '../repositories/order.repository.js'
import * as cartRepo from '../repositories/cart.repository.js'
import * as addressRepo from '../repositories/address.repository.js'
import * as checkoutService from './checkout.service.js'
import { ApiError } from '../utils/ApiError.js'
import { MSG } from '../constants/messages.js'
import { HTTP } from '../constants/httpStatus.js'
import prisma from '../config/db.js'
import { emitToRestaurant, emitToUser } from '../socket/socket.events.js'
import { EVENTS } from '../socket/socket.constants.js'

/**
 * Generate a unique order number (PM-YYYYMMDD-XXXXX)
 */
const generateOrderNumber = () => {
  const date = new Date()
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.floor(10000 + Math.random() * 90000) // 5 digit random number
  return `PM-${datePart}-${randomPart}`
}

/**
 * Create a completed order from the user's cart
 */
export const createOrder = async (userId, { addressId, couponCode, notes, items }) => {
  // 1. Run checkout validations (this throws if range, min order, items, or restaurant is invalid)
  const validation = await checkoutService.validateCheckout(userId, { addressId, couponCode, items })

  const restaurantId = validation.restaurant.id
  const cartId = validation.cartId || null

  // 2. Fetch the address to build the snapshot string
  const address = await addressRepo.findAddressById(addressId)

  const deliveryAddressString = `${address.label}: ${address.street}${
    address.landmark ? ', ' + address.landmark : ''
  }, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`

  // 3. Construct Order data
  const orderData = {
    orderNumber: generateOrderNumber(),
    userId,
    restaurantId,
    couponId: validation.couponApplied ? validation.couponApplied.id : null,
    status: 'PENDING',
    subtotal: validation.totals.subtotal,
    deliveryFee: validation.totals.deliveryFee,
    discount: validation.totals.discount,
    tax: validation.totals.tax,
    totalAmount: validation.totals.grandTotal,
    deliveryAddress: deliveryAddressString,
    deliveryLatitude: address.latitude,
    deliveryLongitude: address.longitude,
    notes: notes || null,
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes ETA
  }

  // 4. Construct Order Items data from validation.items
  const orderItemsData = (validation.items && validation.items.length > 0)
    ? validation.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }))
    : []

  if (orderItemsData.length === 0) {
    throw new ApiError(HTTP.BAD_REQUEST, MSG.CART_EMPTY)
  }

  // 5. Execute transaction-safe order creation
  const order = await orderRepo.createOrder(orderData, orderItemsData, cartId)

  // 6. Real-time Events
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  emitToRestaurant(restaurantId, EVENTS.RESTAURANT_NEW_ORDER, {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: user?.name || 'Customer',
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
  })

  emitToUser(userId, EVENTS.ORDER_CREATED, {
    id: order.id,
    orderNumber: order.orderNumber,
    restaurantName: order.restaurant.name,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
  })

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    restaurantName: order.restaurant.name,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
  }
}

/**
 * Get paginated orders for a customer
 */
export const getOrders = async (userId, query) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', order = 'desc' } = query
  const skip = (page - 1) * limit

  const { orders, total } = await orderRepo.findOrdersByUserId(userId, {
    status,
    skip,
    take: limit,
    sortBy,
    order,
  })

  return {
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      restaurant: {
        id: o.restaurant.id,
        name: o.restaurant.name,
        image: o.restaurant.image,
        city: o.restaurant.city,
      },
      status: o.status,
      itemsCount: o._count.items,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Retrieve full order details by ID
 */
export const getOrderById = async (userId, orderId, userRole) => {
  const order = await orderRepo.findOrderById(orderId)
  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, MSG.ORDER_NOT_FOUND)
  }

  // Authorize: Only the owner or an ADMIN can view this order
  if (order.userId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(HTTP.FORBIDDEN, MSG.FORBIDDEN)
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    restaurant: {
      id: order.restaurant.id,
      name: order.restaurant.name,
      phone: order.restaurant.phone,
      street: order.restaurant.street,
      city: order.restaurant.city,
      image: order.restaurant.image,
    },
    status: order.status,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    tax: Number(order.tax),
    totalAmount: Number(order.totalAmount),
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    cancellationReason: order.cancellationReason,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    coupon: order.coupon ? { code: order.coupon.code, description: order.coupon.description } : null,
    payment: order.payment
      ? { method: order.payment.method, status: order.payment.status, transactionId: order.payment.transactionId }
      : null,
    review: order.review ? { rating: order.review.rating, comment: order.review.comment } : null,
  }
}
