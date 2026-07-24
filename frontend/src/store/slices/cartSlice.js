import { createSlice } from '@reduxjs/toolkit'
import { logout } from './authSlice.js'

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('platemate_cart')
    return saved ? JSON.parse(saved) : { items: [], restaurantId: null, restaurantName: '' }
  } catch {
    return { items: [], restaurantId: null, restaurantName: '' }
  }
}

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('platemate_cart', JSON.stringify(cart))
  } catch {
    // Ignore storage errors
  }
}

const defaultCartState = { items: [], restaurantId: null, restaurantName: '' }
const initialState = loadCartFromStorage()

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { item, restaurant } = action.payload

      // If cart has items from a different restaurant, clear it
      if (state.restaurantId && state.restaurantId !== restaurant.id) {
        state.items = []
      }

      state.restaurantId = restaurant.id
      state.restaurantName = restaurant.name

      const existingIndex = state.items.findIndex(i => i.id === item.id)
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += 1
      } else {
        state.items.push({ ...item, quantity: 1 })
      }
      saveCartToStorage(state)
    },

    removeItem(state, action) {
      const itemId = action.payload
      state.items = state.items.filter(i => i.id !== itemId)
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = ''
      }
      saveCartToStorage(state)
    },

    updateQuantity(state, action) {
      const { itemId, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter(i => i.id !== itemId)
      } else {
        const item = state.items.find(i => i.id === itemId)
        if (item) item.quantity = quantity
      }
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = ''
      }
      saveCartToStorage(state)
    },

    clearCart(state) {
      state.items = []
      state.restaurantId = null
      state.restaurantName = ''
      saveCartToStorage(state)
    },

    applyCoupon(state, action) {
      state.coupon = action.payload
      saveCartToStorage(state)
    },

    removeCoupon(state) {
      state.coupon = null
      saveCartToStorage(state)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      localStorage.removeItem('platemate_cart')
      return defaultCartState
    })
  },
})

// Selectors
export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export const { addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions
export default cartSlice.reducer
