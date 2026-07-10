import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoginModalOpen: false,
  isSignupModalOpen: false,
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleLoginModal(state) {
      state.isLoginModalOpen = !state.isLoginModalOpen
      state.isSignupModalOpen = false
    },
    toggleSignupModal(state) {
      state.isSignupModalOpen = !state.isSignupModalOpen
      state.isLoginModalOpen = false
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false
    },
    toggleCartDrawer(state) {
      state.isCartDrawerOpen = !state.isCartDrawerOpen
    },
    closeAllModals(state) {
      state.isLoginModalOpen = false
      state.isSignupModalOpen = false
      state.isCartDrawerOpen = false
    },
    setTheme(state, action) {
      state.theme = action.payload
    },
  },
})

export const {
  toggleLoginModal, toggleSignupModal, toggleMobileMenu,
  closeMobileMenu, toggleCartDrawer, closeAllModals, setTheme,
} = uiSlice.actions
export default uiSlice.reducer
