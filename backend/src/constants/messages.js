/**
 * messages.js — Shared API Response Messages
 *
 * WHY CENTRALIZE MESSAGES?
 * 1. Consistency: "User not found" vs "user not found" vs "No user found" —
 *    having them in one place ensures every part of the app says the same thing.
 * 2. i18n-ready: When you want to add multiple languages later, you only
 *    change this one file (or swap it with a translation system).
 * 3. Testability: Tests can import these constants instead of hardcoding
 *    expected strings.
 */

export const MSG = {
  // ── Auth ─────────────────────────────────────────────────────────────────
  REGISTER_SUCCESS: 'Account created. Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  TOKEN_REFRESHED: 'Access token refreshed.',
  EMAIL_VERIFIED: 'Email verified successfully. You can now log in.',
  EMAIL_VERIFY_SENT: 'Verification email sent. Please check your inbox.',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password updated successfully. Please log in.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  EMAIL_ALREADY_VERIFIED: 'Your email is already verified.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid authentication token.',
  UNAUTHORIZED: 'You must be logged in to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  LOGOUT_ALL_SUCCESS: 'Logged out from all devices successfully.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully. Please log in again.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  RESEND_VERIFY_SUCCESS: 'Verification email re-sent. Please check your inbox.',
  INVALID_RESET_TOKEN: 'This password reset link has expired or is invalid.',
  INVALID_VERIFY_TOKEN: 'This verification link has expired or is invalid.',

  // ── User ─────────────────────────────────────────────────────────────────
  PROFILE_FETCHED: 'Profile fetched successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  ACCOUNT_DELETED: 'Account deleted successfully.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  PHONE_ALREADY_EXISTS: 'An account with this phone number already exists.',
  USER_NOT_FOUND: 'User not found.',

  // ── Restaurant ────────────────────────────────────────────────────────────
  RESTAURANTS_FETCHED: 'Restaurants fetched successfully.',
  RESTAURANT_FETCHED: 'Restaurant fetched successfully.',
  RESTAURANT_CREATED: 'Restaurant registered successfully.',
  RESTAURANT_UPDATED: 'Restaurant updated successfully.',
  RESTAURANT_DELETED: 'Restaurant deleted successfully.',
  RESTAURANT_NOT_FOUND: 'Restaurant not found.',
  RESTAURANT_CLOSED: 'This restaurant is currently closed.',

  // ── Menu ─────────────────────────────────────────────────────────────────
  MENU_FETCHED: 'Menu fetched successfully.',
  MENU_ITEM_CREATED: 'Menu item created successfully.',
  MENU_ITEM_UPDATED: 'Menu item updated successfully.',
  MENU_ITEM_DELETED: 'Menu item deleted successfully.',
  MENU_ITEM_NOT_FOUND: 'Menu item not found.',
  MENU_ITEM_UNAVAILABLE: 'This menu item is currently unavailable.',

  // ── Cart ─────────────────────────────────────────────────────────────────
  CART_FETCHED: 'Cart fetched successfully.',
  CART_UPDATED: 'Cart updated successfully.',
  CART_CLEARED: 'Cart cleared.',
  CART_EMPTY: 'Your cart is empty.',
  CART_RESTAURANT_CONFLICT: 'Your cart contains items from another restaurant. Clear your cart to add items from this restaurant.',

  // ── Order ─────────────────────────────────────────────────────────────────
  ORDER_PLACED: 'Order placed successfully.',
  ORDER_FETCHED: 'Order fetched successfully.',
  ORDERS_FETCHED: 'Orders fetched successfully.',
  ORDER_UPDATED: 'Order updated successfully.',
  ORDER_CANCELLED: 'Order cancelled successfully.',
  ORDER_NOT_FOUND: 'Order not found.',
  ORDER_CANNOT_CANCEL: 'This order can no longer be cancelled.',

  // ── Address ───────────────────────────────────────────────────────────────
  ADDRESS_CREATED: 'Address saved successfully.',
  ADDRESS_UPDATED: 'Address updated successfully.',
  ADDRESS_DELETED: 'Address deleted successfully.',
  ADDRESSES_FETCHED: 'Addresses fetched successfully.',
  ADDRESS_NOT_FOUND: 'Address not found.',

  // ── Review ────────────────────────────────────────────────────────────────
  REVIEW_CREATED: 'Review submitted successfully.',
  REVIEWS_FETCHED: 'Reviews fetched successfully.',
  REVIEW_DELETED: 'Review deleted successfully.',
  REVIEW_NOT_FOUND: 'Review not found.',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this restaurant.',
  REVIEW_ORDER_REQUIRED: 'You can only review restaurants you have ordered from.',

  // ── Coupon ────────────────────────────────────────────────────────────────
  COUPON_APPLIED: 'Coupon applied successfully.',
  COUPON_REMOVED: 'Coupon removed.',
  COUPON_NOT_FOUND: 'Coupon not found.',
  COUPON_EXPIRED: 'This coupon has expired.',
  COUPON_INVALID: 'This coupon is invalid or cannot be applied.',
  COUPON_MIN_ORDER: 'Minimum order amount not met for this coupon.',

  // ── Payment ───────────────────────────────────────────────────────────────
  PAYMENT_INITIATED: 'Payment initiated.',
  PAYMENT_SUCCESS: 'Payment successful.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PAYMENT_REFUNDED: 'Refund processed successfully.',

  // ── Upload ────────────────────────────────────────────────────────────────
  IMAGE_UPLOADED: 'Image uploaded successfully.',
  IMAGE_DELETED: 'Image deleted successfully.',
  UPLOAD_FAILED: 'Image upload failed. Please try again.',
  INVALID_FILE_TYPE: 'Only image files are allowed (JPEG, PNG, WEBP).',
  FILE_TOO_LARGE: 'File size must not exceed 5MB.',

  // ── Generic ───────────────────────────────────────────────────────────────
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down.',
}
