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
  GOOGLE_ROLE_CONFLICT: 'This Google account is already registered with a different role.',


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

  // ── Rider (Phase 7) ───────────────────────────────────────────────────────
  RIDER_NOT_FOUND: 'Delivery partner profile not found.',
  RIDER_NOT_APPROVED: 'Your delivery partner account is not yet approved. Please wait for admin approval.',
  RIDER_DASHBOARD_FETCHED: 'Rider dashboard stats retrieved successfully.',
  RIDER_PROFILE_FETCHED: 'Rider profile retrieved successfully.',
  RIDER_PROFILE_UPDATED: 'Rider profile updated successfully.',
  RIDER_STATUS_FETCHED: 'Rider availability status retrieved successfully.',
  RIDER_STATUS_UPDATED: 'Rider availability status updated successfully.',
  RIDER_ORDERS_FETCHED: 'Active deliveries retrieved successfully.',
  RIDER_ORDER_FETCHED: 'Delivery details retrieved successfully.',
  RIDER_ORDER_NOT_FOUND: 'Delivery not found or not assigned to you.',
  RIDER_HISTORY_FETCHED: 'Delivery history retrieved successfully.',
  RIDER_EARNINGS_FETCHED: 'Earnings data retrieved successfully.',
  RIDER_ANALYTICS_FETCHED: 'Rider analytics retrieved successfully.',
  RIDER_NOTIFICATIONS_FETCHED: 'Rider notifications retrieved successfully.',
  RIDER_NOTIFICATION_READ: 'Notification marked as read.',
  RIDER_ALL_NOTIFICATIONS_READ: 'All notifications marked as read.',
  RIDER_NOTIFICATION_NOT_FOUND: 'Notification not found.',
  RIDER_STATUS_UPDATE_SUCCESS: 'Delivery status updated successfully.',
  INVALID_STATUS_TRANSITION: 'Invalid status transition. This status change is not allowed.',
  RIDER_ALREADY_HAS_ACTIVE: 'You already have an active delivery. Complete it before accepting a new one.',

  // ── Admin (Phase 8) ─────────────────────────────────────────────────────────
  ADMIN_DASHBOARD_FETCHED: 'Admin dashboard statistics retrieved successfully.',
  ADMIN_CUSTOMERS_FETCHED: 'Customers list retrieved successfully.',
  ADMIN_CUSTOMER_FETCHED: 'Customer details retrieved successfully.',
  ADMIN_CUSTOMER_UPDATED: 'Customer status updated successfully.',
  ADMIN_RESTAURANTS_FETCHED: 'Restaurants list retrieved successfully.',
  ADMIN_RESTAURANT_FETCHED: 'Restaurant details retrieved successfully.',
  ADMIN_RESTAURANT_APPROVED: 'Restaurant owner approved successfully.',
  ADMIN_RESTAURANT_REJECTED: 'Restaurant owner registration rejected.',
  ADMIN_RESTAURANT_SUSPENDED: 'Restaurant suspended successfully.',
  ADMIN_RESTAURANT_ACTIVATED: 'Restaurant activated successfully.',
  ADMIN_RIDERS_FETCHED: 'Riders list retrieved successfully.',
  ADMIN_RIDER_FETCHED: 'Rider details retrieved successfully.',
  ADMIN_RIDER_APPROVED: 'Rider approved successfully.',
  ADMIN_RIDER_REJECTED: 'Rider registration rejected.',
  ADMIN_RIDER_SUSPENDED: 'Rider suspended successfully.',
  ADMIN_RIDER_ACTIVATED: 'Rider activated successfully.',
  ADMIN_ORDERS_FETCHED: 'Orders list retrieved successfully.',
  ADMIN_ORDER_FETCHED: 'Order details retrieved successfully.',
  ADMIN_ORDER_CANCELLED: 'Order cancelled by admin successfully.',
  ADMIN_ORDER_CANNOT_CANCEL: 'This order cannot be cancelled.',
  ADMIN_REVIEWS_FETCHED: 'Reviews retrieved successfully.',
  ADMIN_REVIEW_HIDDEN: 'Review hidden successfully.',
  ADMIN_REVIEW_RESTORED: 'Review restored successfully.',
  ADMIN_COUPONS_FETCHED: 'Coupons retrieved successfully.',
  ADMIN_COUPON_FETCHED: 'Coupon details retrieved successfully.',
  ADMIN_COUPON_CREATED: 'Coupon created successfully.',
  ADMIN_COUPON_UPDATED: 'Coupon updated successfully.',
  ADMIN_COUPON_DELETED: 'Coupon deleted successfully.',
  ADMIN_CUISINES_FETCHED: 'Global categories (cuisines) retrieved successfully.',
  ADMIN_CUISINE_CREATED: 'Global category created successfully.',
  ADMIN_CUISINE_UPDATED: 'Global category updated successfully.',
  ADMIN_CUISINE_DELETED: 'Global category deleted successfully.',
  ADMIN_CUISINE_IN_USE: 'Cannot delete global category because it is currently in use by one or more restaurants.',
  ADMIN_CUISINE_NOT_FOUND: 'Global category not found.',
  ADMIN_ANALYTICS_FETCHED: 'Platform analytics retrieved successfully.',
  ADMIN_NOTIFICATION_SENT: 'Broadcast notification sent successfully.',
  ADMIN_SETTINGS_FETCHED: 'Platform settings retrieved successfully.',
  ADMIN_CANNOT_SUSPEND_ADMIN: 'Access denied: You cannot suspend or deactivate another ADMIN user.',
  ADMIN_NOTIFICATIONS_FETCHED: 'Admin notifications retrieved successfully.',

  // ── Payments (Phase 10) ───────────────────────────────────────────────────
  PAYMENT_INITIALIZED: 'Payment order initialized successfully.',
  PAYMENT_VERIFIED: 'Payment signature verified and captured successfully.',
  PAYMENT_ALREADY_PAID: 'This order has already been paid for.',
  PAYMENT_NOT_FOUND: 'Payment record not found.',
  PAYMENT_INVALID_SIGNATURE: 'Invalid payment signature. Verification failed.',
  PAYMENT_REFUND_EXCEEDED: 'Refund amount exceeds the captured payment amount.',
  PAYMENT_REFUND_NOT_ALLOWED: 'Refunds are only allowed for paid or cancelled orders.',
  PAYMENT_HISTORY_FETCHED: 'Payment history retrieved successfully.',
  PAYMENT_ANALYTICS_FETCHED: 'Payment analytics retrieved successfully.',
  PAYMENT_WEBHOOK_PROCESSED: 'Payment webhook event processed successfully.',
  PAYMENT_REFUNDED: 'Payment refund processed successfully.',

  // ── Generic ────────────────────────────────────────────────────────────────────────────────
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down.',

  // ── Security (Phase 13) ─────────────────────────────────────────────────────────────────────
  ACCOUNT_LOCKED: 'Your account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes.',
  INVALID_FILE_SIGNATURE: 'File content does not match its declared type. Upload rejected.',
  AUDIT_LOGS_FETCHED: 'Audit logs retrieved successfully.',
}
