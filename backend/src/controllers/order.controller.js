import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import * as orderService from '../services/order.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const createOrder = asyncHandler(async (req, res) => {
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
