import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import cartReducer from './slices/cartSlice.js'
import restaurantReducer from './slices/restaurantSlice.js'
import orderReducer from './slices/orderSlice.js'
import uiReducer from './slices/uiSlice.js'
import profileReducer from './slices/profileSlice.js'
import partnerReducer from './slices/partnerSlice.js'
import riderReducer from './slices/riderSlice.js'
import adminReducer from './slices/adminSlice.js'
import addressReducer from './slices/addressSlice.js'
import paymentReducer from './slices/paymentSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    partner: partnerReducer,
    rider: riderReducer,
    admin: adminReducer,
    cart: cartReducer,
    restaurants: restaurantReducer,
    orders: orderReducer,
    ui: uiReducer,
    addresses: addressReducer,
    payment: paymentReducer,
  },
})

export default store

