import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Restaurants from './pages/customer/Restaurants.jsx'
import RestaurantDetails from './pages/customer/RestaurantDetails.jsx'
import Cart from './pages/customer/Cart.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'

// Placeholder pages for future phases
function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] pt-20">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500">This page is coming soon!</p>
      </div>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Customer */}
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:slug" element={<RestaurantDetails />} />
        <Route path="/search" element={<ComingSoon title="Search Results" />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ComingSoon title="Checkout" />} />
        <Route path="/orders" element={<ComingSoon title="My Orders" />} />
        <Route path="/order/:id" element={<ComingSoon title="Order Tracking" />} />
        <Route path="/profile" element={<ComingSoon title="My Profile" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Restaurant Owner */}
        <Route path="/restaurant/dashboard" element={<ComingSoon title="Restaurant Dashboard" />} />
        <Route path="/restaurant/menu" element={<ComingSoon title="Menu Manager" />} />
        <Route path="/restaurant/orders" element={<ComingSoon title="Order Manager" />} />
        <Route path="/restaurant/analytics" element={<ComingSoon title="Analytics" />} />

        {/* Delivery */}
        <Route path="/delivery/dashboard" element={<ComingSoon title="Delivery Dashboard" />} />
        <Route path="/delivery/active" element={<ComingSoon title="Active Delivery" />} />
        <Route path="/delivery/history" element={<ComingSoon title="Delivery History" />} />

        {/* Admin */}
        <Route path="/admin" element={<ComingSoon title="Admin Dashboard" />} />
        <Route path="/admin/users" element={<ComingSoon title="User Management" />} />
        <Route path="/admin/restaurants" element={<ComingSoon title="Restaurant Management" />} />
        <Route path="/admin/orders" element={<ComingSoon title="Order Monitoring" />} />

        {/* Static pages */}
        <Route path="/about" element={<ComingSoon title="About Us" />} />
        <Route path="/contact" element={<ComingSoon title="Contact" />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />
        <Route path="/terms" element={<ComingSoon title="Terms of Service" />} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] pt-20">
            <div className="text-center">
              <div className="text-7xl mb-4">404</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
              <p className="text-gray-500">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        } />
      </Routes>
      <Footer />
    </>
  )
}
