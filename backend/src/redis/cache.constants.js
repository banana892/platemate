/**
 * cache.constants.js — Cache key prefixes and TTL definitions for performance optimization (Phase 11)
 */

export const CACHE_KEYS = {
  RESTAURANT: (id) => `restaurant:${id}`,
  MENU: (id) => `restaurant:${id}:menu`,
  CUISINES: 'cuisines',
  SETTINGS: 'settings',
  ADDRESSES: (userId) => `addresses:user:${userId}`,
  ANALYTICS: (key) => `analytics:${key}`,
  BLACKLIST: (jti) => `blacklist:token:${jti}`,

  // Presence Sets
  PRESENCE_USERS: 'presence:online_users',
  PRESENCE_RESTAURANTS: 'presence:online_restaurants',
  PRESENCE_RIDERS: 'presence:online_riders',

  // Set tracking key names so we avoid standard KEYS queries
  TRACKED_KEYS: 'tracked_keys',
}

export const CACHE_TTLS = {
  SETTINGS: 86400,    // 24 hours
  CUISINES: 43200,    // 12 hours
  RESTAURANT: 14400,  // 4 hours
  MENU: 14400,        // 4 hours
  ADDRESSES: 7200,    // 2 hours
  ANALYTICS: 600,     // 10 minutes
  PRESENCE: 60,       // 60 seconds (requires heartbeat/renew)
}
