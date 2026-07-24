import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { USER_ROLES } from './utils/constants.js'

// Common & Error Boundaries
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import NetworkStatus from './components/common/NetworkStatus.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import useIdlePrefetch from './hooks/useIdlePrefetch.js'

// Protected Route Guard & Layouts
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import CustomerLayout from './layouts/CustomerLayout.jsx'
import ProfileLayout from './components/layout/ProfileLayout.jsx'
import Skeleton from './components/ui/Skeleton.jsx'

// Lazy Loaded Public Pages (Phase F5 performance route splitting)
const Home = lazy(() => import('./pages/Home.jsx'))
const Restaurants = lazy(() => import('./pages/customer/Restaurants.jsx'))
const RestaurantDetails = lazy(() => import('./pages/customer/RestaurantDetails.jsx'))
const Cart = lazy(() => import('./pages/customer/Cart.jsx'))
const Checkout = lazy(() => import('./pages/customer/Checkout.jsx'))
const Login = lazy(() => import('./pages/auth/Login.jsx'))
const Signup = lazy(() => import('./pages/auth/Signup.jsx'))
const PartnerOnboardingComplete = lazy(() => import('./pages/auth/PartnerOnboardingComplete.jsx'))
const RiderOnboardingComplete = lazy(() => import('./pages/auth/RiderOnboardingComplete.jsx'))

// Customer Profile Pages (Phase F1)
const ProfilePage = lazy(() => import('./pages/customer/Profile/ProfilePage.jsx'))
const EditProfilePage = lazy(() => import('./pages/customer/Profile/EditProfilePage.jsx'))
const AddressesPage = lazy(() => import('./pages/customer/Profile/AddressesPage.jsx'))
const AddressFormPage = lazy(() => import('./pages/customer/Profile/AddressFormPage.jsx'))
const OrderHistoryPage = lazy(() => import('./pages/customer/Profile/OrderHistoryPage.jsx'))
const OrderDetailsPage = lazy(() => import('./pages/customer/Profile/OrderDetailsPage.jsx'))
const ChangePasswordPage = lazy(() => import('./pages/customer/Profile/ChangePasswordPage.jsx'))
const PreferencesPage = lazy(() => import('./pages/customer/Profile/PreferencesPage.jsx'))
const FavoritesPage = lazy(() => import('./pages/customer/Profile/FavoritesPage.jsx'))
const NotificationsPage = lazy(() => import('./pages/customer/Profile/NotificationsPage.jsx'))

// Restaurant Partner Dashboard Pages (Phase F2)
const PartnerLayout = lazy(() => import('./components/partner/PartnerLayout.jsx'))
const PartnerDashboardPage = lazy(() => import('./pages/partner/Dashboard/DashboardPage.jsx'))
const PartnerProfilePage = lazy(() => import('./pages/partner/Dashboard/RestaurantProfilePage.jsx'))
const PartnerSettingsPage = lazy(() => import('./pages/partner/Dashboard/RestaurantSettingsPage.jsx'))
const BusinessHoursPage = lazy(() => import('./pages/partner/Dashboard/BusinessHoursPage.jsx'))
const MenuPage = lazy(() => import('./pages/partner/Dashboard/MenuPage.jsx'))
const MenuFormPage = lazy(() => import('./pages/partner/Dashboard/MenuFormPage.jsx'))
const CategoriesPage = lazy(() => import('./pages/partner/Dashboard/CategoriesPage.jsx'))
const CategoryFormPage = lazy(() => import('./pages/partner/Dashboard/CategoryFormPage.jsx'))
const PartnerOrdersPage = lazy(() => import('./pages/partner/Dashboard/OrdersPage.jsx'))
const PartnerOrderDetailsPage = lazy(() => import('./pages/partner/Dashboard/OrderDetailsPage.jsx'))
const ReviewsPage = lazy(() => import('./pages/partner/Dashboard/ReviewsPage.jsx'))
const AnalyticsPage = lazy(() => import('./pages/partner/Dashboard/AnalyticsPage.jsx'))

// Delivery Rider Dashboard Pages (Phase F3)
const RiderLayout = lazy(() => import('./components/rider/common/RiderLayout.jsx'))
const RiderDashboardPage = lazy(() => import('./pages/rider/Dashboard/DashboardPage.jsx'))
const RiderProfilePage = lazy(() => import('./pages/rider/ProfilePage.jsx'))
const RiderVehiclePage = lazy(() => import('./pages/rider/VehiclePage.jsx'))
const RiderAvailabilityPage = lazy(() => import('./pages/rider/AvailabilityPage.jsx'))
const RiderActiveDeliveriesPage = lazy(() => import('./pages/rider/ActiveDeliveriesPage.jsx'))
const RiderDeliveryDetailsPage = lazy(() => import('./pages/rider/DeliveryDetailsPage.jsx'))
const RiderDeliveryHistoryPage = lazy(() => import('./pages/rider/DeliveryHistoryPage.jsx'))
const RiderEarningsPage = lazy(() => import('./pages/rider/EarningsPage.jsx'))
const RiderPerformancePage = lazy(() => import('./pages/rider/PerformancePage.jsx'))
const RiderSettingsPage = lazy(() => import('./pages/rider/SettingsPage.jsx'))

// Admin Dashboard Pages (Phase F4)
const AdminLayout = lazy(() => import('./components/admin/common/AdminLayout.jsx'))
const AdminDashboardPage = lazy(() => import('./pages/admin/Dashboard/DashboardPage.jsx'))
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage.jsx'))
const AdminCustomersPage = lazy(() => import('./pages/admin/CustomersPage.jsx'))
const AdminPartnersPage = lazy(() => import('./pages/admin/PartnersPage.jsx'))
const AdminRidersPage = lazy(() => import('./pages/admin/RidersPage.jsx'))
const AdminRestaurantsPage = lazy(() => import('./pages/admin/RestaurantsPage.jsx'))
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersPage.jsx'))
const AdminOrderDetailsPage = lazy(() => import('./pages/admin/OrderDetailsPage.jsx'))
const AdminPaymentsPage = lazy(() => import('./pages/admin/PaymentsPage.jsx'))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage.jsx'))
const AdminDisputesPage = lazy(() => import('./pages/admin/DisputesPage.jsx'))
const AdminNotificationsPage = lazy(() => import('./pages/admin/NotificationsPage.jsx'))
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage.jsx'))
const AdminSystemHealthPage = lazy(() => import('./pages/admin/SystemHealthPage.jsx'))
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage.jsx'))

function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] dark:bg-slate-900 pt-20">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400">This page is coming soon!</p>
      </div>
    </div>
  )
}

function SuspenseFallback() {
  return (
    <div className="p-8 space-y-4 max-w-7xl mx-auto pt-24 min-h-screen">
      <Skeleton variant="card" className="h-40" />
      <Skeleton variant="text" count={3} />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

import { useDispatch } from 'react-redux'
import { checkAuthThunk } from './store/slices/authSlice.js'
import { initAuthTabSync } from './utils/authTabSync.js'

export default function App() {
  const dispatch = useDispatch()
  useIdlePrefetch()

  useEffect(() => {
    const cleanupTabSync = initAuthTabSync(dispatch)

    const params = new URLSearchParams(window.location.search)
    if (!params.get('token')) {
      dispatch(checkAuthThunk())
    }

    return () => {
      if (cleanupTabSync) cleanupTabSync()
    }
  }, [dispatch])

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <NetworkStatus />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          },
        }}
      />
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[300] focus:px-4 focus:py-2 focus:bg-[#FF4F5A] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Standalone Authentication Routes (Clean — No Customer Header/Footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/signup/partner/complete"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.PARTNER, USER_ROLES.ADMIN]}>
                <PartnerOnboardingComplete />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup/rider/complete"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.RIDER, USER_ROLES.ADMIN]}>
                <RiderOnboardingComplete />
              </ProtectedRoute>
            }
          />

          {/* Customer Portal (Customer Layout Route with Navbar & Footer) */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurant/:slug" element={<RestaurantDetails />} />
            <Route path="/search" element={<ComingSoon title="Search Results" />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* Customer Profile & Settings Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <ProfilePage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <EditProfilePage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/addresses"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <AddressesPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/addresses/new"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <AddressFormPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/addresses/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <AddressFormPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/orders"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <OrderHistoryPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/orders/:id"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <OrderDetailsPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/change-password"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <ChangePasswordPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/favorites"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <FavoritesPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/notifications"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <NotificationsPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/preferences"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]}>
                  <ProfileLayout>
                    <PreferencesPage />
                  </ProfileLayout>
                </ProtectedRoute>
              }
            />

            {/* Static pages */}
            <Route path="/about" element={<ComingSoon title="About Us" />} />
            <Route path="/contact" element={<ComingSoon title="Contact" />} />
            <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />
            <Route path="/terms" element={<ComingSoon title="Terms of Service" />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Restaurant Partner Portal Routes */}
          <Route path="/partner" element={<Navigate to="/partner/dashboard" replace />} />
          <Route path="/partner/hours" element={<Navigate to="/partner/business-hours" replace />} />
          <Route
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.PARTNER, USER_ROLES.ADMIN]}>
                <PartnerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
            <Route path="/partner/profile" element={<PartnerProfilePage />} />
            <Route path="/partner/settings" element={<PartnerSettingsPage />} />
            <Route path="/partner/business-hours" element={<BusinessHoursPage />} />
            <Route path="/partner/menu" element={<MenuPage />} />
            <Route path="/partner/menu/new" element={<MenuFormPage />} />
            <Route path="/partner/menu/edit/:id" element={<MenuFormPage />} />
            <Route path="/partner/categories" element={<CategoriesPage />} />
            <Route path="/partner/categories/new" element={<CategoryFormPage />} />
            <Route path="/partner/categories/edit/:id" element={<CategoryFormPage />} />
            <Route path="/partner/orders" element={<PartnerOrdersPage />} />
            <Route path="/partner/orders/:id" element={<PartnerOrderDetailsPage />} />
            <Route path="/partner/reviews" element={<ReviewsPage />} />
            <Route path="/partner/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Delivery Rider Portal Routes */}
          <Route path="/rider" element={<Navigate to="/rider/dashboard" replace />} />
          <Route path="/delivery/dashboard" element={<Navigate to="/rider/dashboard" replace />} />
          <Route path="/delivery/profile" element={<Navigate to="/rider/profile" replace />} />
          <Route path="/delivery/vehicle" element={<Navigate to="/rider/vehicle" replace />} />
          <Route path="/delivery/availability" element={<Navigate to="/rider/availability" replace />} />
          <Route path="/delivery/active" element={<Navigate to="/rider/deliveries" replace />} />
          <Route path="/delivery/history" element={<Navigate to="/rider/history" replace />} />
          <Route path="/delivery/earnings" element={<Navigate to="/rider/earnings" replace />} />
          <Route path="/delivery/performance" element={<Navigate to="/rider/performance" replace />} />
          <Route path="/delivery/settings" element={<Navigate to="/rider/settings" replace />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.RIDER, USER_ROLES.ADMIN]}>
                <RiderLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/rider/dashboard" element={<RiderDashboardPage />} />
            <Route path="/rider/profile" element={<RiderProfilePage />} />
            <Route path="/rider/vehicle" element={<RiderVehiclePage />} />
            <Route path="/rider/availability" element={<RiderAvailabilityPage />} />
            <Route path="/rider/deliveries" element={<RiderActiveDeliveriesPage />} />
            <Route path="/rider/deliveries/:id" element={<RiderDeliveryDetailsPage />} />
            <Route path="/rider/history" element={<RiderDeliveryHistoryPage />} />
            <Route path="/rider/earnings" element={<RiderEarningsPage />} />
            <Route path="/rider/performance" element={<RiderPerformancePage />} />
            <Route path="/rider/settings" element={<RiderSettingsPage />} />
          </Route>

          {/* Admin Operations Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="riders" element={<AdminRidersPage />} />
            <Route path="restaurants" element={<AdminRestaurantsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="disputes" element={<AdminDisputesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="system" element={<AdminSystemHealthPage />} />
            <Route path="audit" element={<AdminAuditLogsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
