import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as orderService from '../services/order.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

import prisma from '../config/db.js'

export const createOrder = asyncHandler(async (req, res) => {
  console.log('🔍 [HYPOTHESIS CHECK - 1. Incoming Request Body to POST /orders]:', JSON.stringify(req.body, null, 2))

  const receivedItems = req.body.items || []
  const receivedMenuItemIds = receivedItems.map((item) => String(item.menuItemId || item.id))
  console.log('🔍 [HYPOTHESIS CHECK - 2. menuItemIds received from frontend]:', receivedMenuItemIds)

  const matchingMenuItems = await prisma.menuItem.findMany({
    where: { id: { in: receivedMenuItemIds } },
  })

  console.log('🔍 [HYPOTHESIS CHECK - 3 & 4. MenuItem Existence Check]:', receivedMenuItemIds.map((id) => ({
    receivedId: id,
    existsInDb: matchingMenuItems.some((m) => m.id === id),
  })))

  const sampleDbMenuItems = await prisma.menuItem.findMany({
    take: 10,
    select: { id: true, name: true, restaurantId: true },
  })
  console.log('🔍 [HYPOTHESIS CHECK - 5. Sample IDs stored in MenuItem table]:', sampleDbMenuItems)

  const result = await orderService.createOrder(req.user.id, req.body)
  res.status(HTTP.CREATED).json({
    success: true,
    message: MSG.ORDER_PLACED,
    data: result,
  })
})

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.user.id, req.query)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ORDERS_FETCHED,
    data: result,
  })
})

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const order = await orderService.getOrderById(req.user.id, id, req.user.role)
  res.status(HTTP.OK).json({
    success: true,
    message: MSG.ORDER_FETCHED,
    data: order,
  })
})
