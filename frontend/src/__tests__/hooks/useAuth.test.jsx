import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/slices/authSlice.js'
import { useAuth } from '../../hooks/useAuth.js'

const createMockStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  })

describe('useAuth Hook', () => {
  it('returns default initial authentication state', () => {
    const store = createMockStore()
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('updates state on login and logout actions', () => {
    const store = createMockStore()
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

    const { result } = renderHook(() => useAuth(), { wrapper })

    const mockUser = { id: 'usr_1', email: 'arjun@platemate.com', name: 'Arjun' }

    act(() => {
      result.current.login(mockUser)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
