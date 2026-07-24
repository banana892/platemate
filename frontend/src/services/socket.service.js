/**
 * socket.service.js — Real-Time Socket.io Connection Manager (Phase F3)
 *
 * Manages WebSocket connection for riders using JWT token authentication.
 * Listens for real-time order assignments, delivery updates, and notifications.
 */

import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.listeners = new Map()
  }

  /**
   * Initialize socket connection with JWT token
   */
  connect() {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    if (this.socket && this.connected) {
      return
    }

    const socketUrl = window.location.origin

    this.socket = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    this.socket.on('connect', () => {
      this.connected = true
      console.log('[Socket] Connected with socket ID:', this.socket.id)
    })

    this.socket.on('disconnect', (reason) => {
      this.connected = false
      console.log('[Socket] Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message)
    })

    // Re-attach existing event listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback)
    })
  }

  /**
   * Disconnect socket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    this.listeners.set(event, callback)
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Remove event listener
   */
  off(event) {
    this.listeners.delete(event)
    if (this.socket) {
      this.socket.off(event)
    }
  }

  /**
   * Send heartbeat or emit custom event
   */
  emit(event, data, callback) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data, callback)
    }
  }
}

export const socketService = new SocketService()
export default socketService
