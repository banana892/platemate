/**
 * socket.constants.js — Event Names & Configuration Constants for Real-Time Layer (Phase 9)
 *
 * Centralizes all event and room prefixes to prevent magic string issues.
 */

export const EVENTS = {
  // Connection Events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  HEARTBEAT: 'heartbeat',
  SOCKET_ERROR: 'socket:error',

  // Customer Events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_CANCELLED: 'order:cancelled',
  NOTIFICATION_NEW: 'notification:new',

  // Restaurant Events
  RESTAURANT_NEW_ORDER: 'restaurant:new-order',
  RESTAURANT_ORDER_UPDATED: 'restaurant:order-updated',
  RESTAURANT_NOTIFICATION: 'restaurant:notification',
  RESTAURANT_BRANDING_UPDATED: 'restaurant:branding-updated',
  MENU_ITEMS_UPDATED: 'restaurant:menu-updated',

  // Rider Events
  RIDER_NEW_ASSIGNMENT: 'rider:new-assignment',
  RIDER_DELIVERY_UPDATED: 'rider:delivery-updated',
  RIDER_NOTIFICATION: 'rider:notification',

  // Admin Events
  ADMIN_NOTIFICATION: 'admin:notification',
  ADMIN_DASHBOARD_REFRESH: 'admin:dashboard-refresh',

  // Payment Events
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',
  PAYMENT_REFUNDED: 'payment:refunded',
}

export const ROOMS = {
  USER: (userId) => `user:${userId}`,
  RESTAURANT: (restaurantId) => `restaurant:${restaurantId}`,
  RIDER: (deliveryPartnerId) => `rider:${deliveryPartnerId}`,
  ADMIN: 'admin',
}
