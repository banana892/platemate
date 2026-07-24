/**
 * socket.events.js — Event Dispatcher Utilities for Real-Time Layer (Phase 9)
 *
 * Implements clean emission utilities used by REST service components without DB-level mutation logic.
 */

import { getIo } from './socket.server.js'
import { ROOMS, EVENTS } from './socket.constants.js'
import logger from '../config/logger.js'

/**
 * Emit an event to a specific room with validation/logging.
 */
export const emitToRoom = (room, event, data) => {
  const io = getIo()
  if (!io) {
    logger.debug({ room, event }, 'Socket server not running. Event emission skipped.')
    return false
  }

  logger.debug({ room, event }, `Emitting real-time update to room: ${room}`)
  io.to(room).emit(event, data)
  return true
}

/**
 * Emit update to a customer private room.
 */
export const emitToUser = (userId, event, data) => {
  return emitToRoom(ROOMS.USER(userId), event, data)
}

/**
 * Emit update to a restaurant room.
 */
export const emitToRestaurant = (restaurantId, event, data) => {
  return emitToRoom(ROOMS.RESTAURANT(restaurantId), event, data)
}

/**
 * Emit update to an assigned rider room.
 */
export const emitToRider = (deliveryPartnerId, event, data) => {
  return emitToRoom(ROOMS.RIDER(deliveryPartnerId), event, data)
}

/**
 * Emit update to all connected admins.
 */
export const emitToAdmins = (event, data) => {
  return emitToRoom(ROOMS.ADMIN, event, data)
}
