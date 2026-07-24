import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../../store/slices/cartSlice.js'
import { useCart } from '../../hooks/useCart.js'

const createMockStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
    },
  })

describe('useCart Hook', () => {
  it('returns default empty cart state', () => {
    const store = createMockStore()
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('adds item to cart and updates count and subtotal', () => {
    const store = createMockStore()
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

    const { result } = renderHook(() => useCart(), { wrapper })

    const mockItem = { id: 'item_1', name: 'Biryani', price: 300 }
    const mockRestaurant = { id: 'rest_1', name: 'Biryani Palace' }

    act(() => {
      result.current.addItem(mockItem, mockRestaurant)
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.count).toBe(1)
    expect(result.current.subtotal).toBe(300)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items.length).toBe(0)
  })
})
