/**
 * socket.rooms.js — Room Mapping Utilities for Socket.io (Phase 9)
 *
 * Resolves appropriate room joins for users based on database associations and RBAC roles.
 */

import prisma from '../config/db.js'
import logger from '../config/logger.js'
import { ROOMS } from './socket.constants.js'

/**
 * Handle room joins for an authenticated socket client.
 */
export const joinRoleRooms = async (socket) => {
  const { id: userId, role } = socket.user

  // 1. Join user-specific private room (all users get this)
  socket.join(ROOMS.USER(userId))
  logger.debug({ socketId: socket.id, room: ROOMS.USER(userId) }, 'Socket joined private room')

  // 2. Role-specific rooms
  try {
    if (role === 'PARTNER') {
      // Find restaurants owned by this partner
      const owner = await prisma.restaurantOwner.findUnique({
        where: { userId },
        include: { restaurants: { select: { id: true } } },
      })

      if (owner && owner.restaurants.length > 0) {
        for (const restaurant of owner.restaurants) {
          socket.join(ROOMS.RESTAURANT(restaurant.id))
          logger.debug(
            { socketId: socket.id, room: ROOMS.RESTAURANT(restaurant.id) },
            'Socket joined restaurant room'
          )
        }
      }
    } else if (role === 'RIDER') {
      // Find delivery partner profile for this rider user
      const rider = await prisma.deliveryPartner.findUnique({
        where: { userId },
        select: { id: true },
      })

      if (rider) {
        socket.join(ROOMS.RIDER(rider.id))
        logger.debug({ socketId: socket.id, room: ROOMS.RIDER(rider.id) }, 'Socket joined rider room')
      }
    } else if (role === 'ADMIN') {
      socket.join(ROOMS.ADMIN)
      logger.debug({ socketId: socket.id, room: ROOMS.ADMIN }, 'Socket joined admin room')
    }
  } catch (err) {
    logger.error({ socketId: socket.id, err: err.message }, 'Error joining role rooms')
  }
}

/**
 * Helper to fetch all room IDs a socket is currently in (excluding private socket.id room).
 */
export const getActiveRooms = (socket) => {
  return Array.from(socket.rooms).filter((room) => room !== socket.id)
}
