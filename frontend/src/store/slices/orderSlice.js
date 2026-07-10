import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    placeOrder(state, action) {
      state.orders.unshift(action.payload)
      state.currentOrder = action.payload
    },
    updateOrderStatus(state, action) {
      const { orderId, status } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) order.status = status
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status
      }
    },
    setCurrentOrder(state, action) {
      state.currentOrder = action.payload
    },
    setOrders(state, action) {
      state.orders = action.payload
    },
    setLoading(state, action) {
      state.isLoading = action.payload
    },
  },
})

export const { placeOrder, updateOrderStatus, setCurrentOrder, setOrders, setLoading } = orderSlice.actions
export default orderSlice.reducer
