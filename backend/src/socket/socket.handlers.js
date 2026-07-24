/**
 * socket.handlers.js — Client Handlers and Presence Tracking (Phase 9)
 *
 * Stores online state in-memory only (no Redis). Tracks multiple connections per client.
 */

import logger from '../config/logger.js'
import prisma from '../config/db.js'
import { joinRoleRooms } from './socket.rooms.js'
import { EVENTS } from './socket.constants.js'

// In-memory presence states
export const presence = {
  // Maps userId -> Set of socketIds
  onlineUsers: new Map(),
  // Maps restaurantId -> Set of partner socketIds
  onlineRestaurants: new Map(),
  // Maps deliveryPartnerId -> Set of rider socketIds
  onlineRiders: new Map(),
}

/**
 * Handle new socket client connection lifecycle.
 */
export const handleConnection = async (socket, io) => {
  const { id: userId, role } = socket.user
  logger.info({ socketId: socket.id, userId, role }, 'Socket connected and authenticated')

  // 1. Presence Tracking: Add socket to user's set of active connections
  if (!presence.onlineUsers.has(userId)) {
    presence.onlineUsers.set(userId, new Set())
  }
  presence.onlineUsers.get(userId).add(socket.id)

  const { addPresence } = await import('../redis/redis.service.js')
  await addPresence('users', userId, socket.id, 60)

  // Role-specific presence tracking & initialization
  try {
    if (role === 'PARTNER') {
      const owner = await prisma.restaurantOwner.findUnique({
        where: { userId },
        include: { restaurants: { select: { id: true } } },
      })
      if (owner && owner.restaurants.length > 0) {
        for (const restaurant of owner.restaurants) {
          if (!presence.onlineRestaurants.has(restaurant.id)) {
            presence.onlineRestaurants.set(restaurant.id, new Set())
          }
          presence.onlineRestaurants.get(restaurant.id).add(socket.id)
          await addPresence('restaurants', restaurant.id, socket.id, 60)
        }
      }
    } else if (role === 'RIDER') {
      const rider = await prisma.deliveryPartner.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (rider) {
        if (!presence.onlineRiders.has(rider.id)) {
          presence.onlineRiders.set(rider.id, new Set())
        }
        presence.onlineRiders.get(rider.id).add(socket.id)
        await addPresence('riders', rider.id, socket.id, 60)
      }
    }
  } catch (err) {
    logger.error({ socketId: socket.id, err: err.message }, 'Failed to initialize presence for connection')
  }

  // 2. Room Joining
  await joinRoleRooms(socket)

  // 3. Register Client Handlers
  socket.on(EVENTS.HEARTBEAT, async (data, callback) => {
    logger.debug({ socketId: socket.id }, 'Socket heartbeat received')
    
    // Heartbeat TTL renewal in Redis
    try {
      const { addPresence } = await import('../redis/redis.service.js')
      await addPresence('users', userId, socket.id, 60)
      if (role === 'PARTNER') {
        const owner = await prisma.restaurantOwner.findUnique({
          where: { userId },
          include: { restaurants: { select: { id: true } } },
        })
        if (owner) {
          for (const restaurant of owner.restaurants) {
            await addPresence('restaurants', restaurant.id, socket.id, 60)
          }
        }
      } else if (role === 'RIDER') {
        const rider = await prisma.deliveryPartner.findUnique({
          where: { userId },
          select: { id: true },
        })
        if (rider) {
          await addPresence('riders', rider.id, socket.id, 60)
        }
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to process socket heartbeat presence renewal')
    }

    if (typeof callback === 'function') {
      callback({ status: 'ok', timestamp: new Date().toISOString() })
    }
  })

  // 4. Disconnect cleanup handler
  socket.on(EVENTS.DISCONNECT, (reason) => {
    handleDisconnect(socket, reason)
  })
}

/**
 * Handle client disconnection and clean up in-memory presence maps.
 */
const handleDisconnect = async (socket, reason) => {
  const { id: userId, role } = socket.user
  logger.info({ socketId: socket.id, userId, role, reason }, 'Socket disconnected')

  // 1. Remove socket from online user connections
  const userSockets = presence.onlineUsers.get(userId)
  if (userSockets) {
    userSockets.delete(socket.id)
    if (userSockets.size === 0) {
      presence.onlineUsers.delete(userId)
    }
  }

  const { removePresence } = await import('../redis/redis.service.js')
  await removePresence('users', userId)

  // 2. Clean up role-specific presence maps
  try {
    if (role === 'PARTNER') {
      const owner = await prisma.restaurantOwner.findUnique({
        where: { userId },
        include: { restaurants: { select: { id: true } } },
      })
      if (owner && owner.restaurants.length > 0) {
        for (const restaurant of owner.restaurants) {
          const restaurantSockets = presence.onlineRestaurants.get(restaurant.id)
          if (restaurantSockets) {
            restaurantSockets.delete(socket.id)
            if (restaurantSockets.size === 0) {
              presence.onlineRestaurants.delete(restaurant.id)
            }
          }
          await removePresence('restaurants', restaurant.id)
        }
      }
    } else if (role === 'RIDER') {
      const rider = await prisma.deliveryPartner.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (rider) {
        const riderSockets = presence.onlineRiders.get(rider.id)
        if (riderSockets) {
          riderSockets.delete(socket.id)
          if (riderSockets.size === 0) {
            presence.onlineRiders.delete(rider.id)
          }
        }
        await removePresence('riders', rider.id)
      }
    }
  } catch (err) {
    logger.error({ socketId: socket.id, err: err.message }, 'Failed to clean up presence on disconnect')
  }
}
