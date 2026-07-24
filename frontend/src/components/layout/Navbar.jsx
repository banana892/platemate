import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiMapPin,
  FiBell,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi'
import { IoRestaurantOutline } from 'react-icons/io5'
import { useCart } from '../../hooks/useCart.js'
import { useAuth } from '../../hooks/useAuth.js'
import { executeLogout } from '../../utils/authUtils.js'
import { NAV_LINKS, BRAND } from '../../utils/constants.js'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { count } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    setMobileOpen(false)
    await executeLogout(logout, navigate)
  }

  const navBg = !isHome || scrolled
    ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
    : 'bg-transparent'

  const textColor = !isHome || scrolled ? 'text-gray-800' : 'text-white/90'
  const brandColor = !isHome || scrolled ? 'text-gray-900' : 'text-white'
  const hoverBg = !isHome || scrolled
    ? 'hover:text-[#FF4F5A] hover:bg-[#FF4F5A]/5'
    : 'hover:text-white hover:bg-white/10'

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${navBg} ${scrolled || !isHome ? 'py-3 px-6 md:px-12' : 'py-5 px-6 md:px-12'}`}
    >
      {/* Brand */}
      <Link to="/" className={`flex items-center gap-2.5 text-2xl font-extrabold z-10 ${brandColor}`}>
        <IoRestaurantOutline className="text-xl gradient-text" />
        <span>{BRAND.name}</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`${textColor} text-[0.95rem] font-medium py-2 px-4 rounded-lg transition-smooth ${hoverBg}`}
          >
            {link.label}
          </a>
        ))}

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative ${textColor} py-2 px-4 rounded-lg transition-smooth ${hoverBg} flex items-center gap-2`}
        >
          <FiShoppingCart className="text-lg" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 gradient-bg text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
              {count}
            </span>
          )}
        </Link>

        {/* Auth Buttons / Profile Dropdown */}
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              className={`text-[0.95rem] font-medium py-2 px-4 rounded-lg border transition-smooth ${
                !isHome || scrolled
                  ? 'border-[#FF4F5A] text-[#FF4F5A] hover:bg-[#FF4F5A]/5'
                  : 'border-white/40 text-white/90 hover:bg-white/10'
              }`}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-[0.95rem] font-medium py-2 px-5 rounded-lg gradient-bg text-white hover:shadow-glow transition-smooth"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2.5 py-1.5 px-3 rounded-full border transition-smooth cursor-pointer ${
                !isHome || scrolled
                  ? 'border-gray-200 bg-gray-50/80 hover:bg-gray-100 text-gray-800'
                  : 'border-white/30 bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User Avatar'}
                  className="w-7 h-7 rounded-full object-cover border border-white/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full gradient-bg text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm font-semibold max-w-[120px] truncate">
                {user?.name || 'Account'}
              </span>
              <FiChevronDown className={`text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-scale-in z-50 text-gray-800">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1 text-sm">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-smooth text-gray-700 font-medium"
                  >
                    <FiUser className="text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/profile/orders"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-smooth text-gray-700 font-medium"
                  >
                    <FiShoppingBag className="text-gray-400" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    to="/profile/favorites"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-smooth text-gray-700 font-medium"
                  >
                    <FiHeart className="text-gray-400" />
                    <span>Favorites</span>
                  </Link>
                  <Link
                    to="/profile/addresses"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-smooth text-gray-700 font-medium"
                  >
                    <FiMapPin className="text-gray-400" />
                    <span>Addresses</span>
                  </Link>
                  <Link
                    to="/profile/notifications"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-smooth text-gray-700 font-medium"
                  >
                    <FiBell className="text-gray-400" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    to="/profile/preferences"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-smooth text-gray-700 font-medium"
                  >
                    <FiSettings className="text-gray-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-rose-50 transition-smooth text-sm font-semibold cursor-pointer"
                  >
                    <FiLogOut className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      <button
        id="mobileToggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`md:hidden z-10 text-2xl ${!isHome || scrolled ? 'text-gray-900' : 'text-white'}`}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 w-72 h-full bg-white z-50 flex flex-col pt-20 px-6 pb-8 shadow-[-8px_0_30px_rgba(0,0,0,0.1)] transition-all duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-gray-800 text-base font-medium py-3 px-4 rounded-lg hover:text-[#FF4F5A] hover:bg-[#FF4F5A]/5 transition-smooth"
          >
            {link.label}
          </a>
        ))}

        <Link
          to="/cart"
          onClick={() => setMobileOpen(false)}
          className="text-gray-800 text-base font-medium py-3 px-4 rounded-lg hover:text-[#FF4F5A] hover:bg-[#FF4F5A]/5 transition-smooth flex items-center gap-3"
        >
          <FiShoppingCart />
          Cart {count > 0 && `(${count})`}
        </Link>

        {isAuthenticated && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-1">
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <FiUser /> Profile
            </Link>
            <Link
              to="/profile/orders"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <FiShoppingBag /> Orders
            </Link>
            <Link
              to="/profile/favorites"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <FiHeart /> Favorites
            </Link>
            <Link
              to="/profile/addresses"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <FiMapPin /> Addresses
            </Link>
            <Link
              to="/profile/notifications"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <FiBell /> Notifications
            </Link>
            <Link
              to="/profile/preferences"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <FiSettings /> Settings
            </Link>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-6">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 px-4 rounded-lg border border-[#FF4F5A] text-[#FF4F5A] font-semibold transition-smooth hover:bg-[#FF4F5A]/5"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 px-4 rounded-lg gradient-bg text-white font-semibold transition-smooth hover:shadow-glow"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-center py-3 px-4 rounded-lg border border-red-500 text-red-600 font-semibold transition-smooth hover:bg-red-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiLogOut /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
