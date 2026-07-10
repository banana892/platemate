import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiSearch } from 'react-icons/fi'
import { IoRestaurantOutline } from 'react-icons/io5'
import { useCart } from '../../hooks/useCart.js'
import { useAuth } from '../../hooks/useAuth.js'
import { NAV_LINKS, BRAND } from '../../utils/constants.js'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count } = useCart()
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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
        {NAV_LINKS.map(link => (
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

        {/* Auth Buttons */}
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
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-[0.95rem] font-medium py-2 px-5 rounded-lg gradient-bg text-white hover:shadow-glow transition-smooth"
            >
              Sign up
            </Link>
          </>
        ) : (
          <Link
            to="/profile"
            className={`${textColor} py-2 px-4 rounded-lg transition-smooth ${hoverBg} flex items-center gap-2`}
          >
            <FiUser className="text-lg" />
          </Link>
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={`fixed top-0 right-0 w-72 h-full bg-white z-50 flex flex-col pt-20 px-6 pb-8 shadow-[-8px_0_30px_rgba(0,0,0,0.1)] transition-all duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {NAV_LINKS.map(link => (
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

        <div className="mt-auto flex flex-col gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 px-4 rounded-lg border border-[#FF4F5A] text-[#FF4F5A] font-semibold transition-smooth hover:bg-[#FF4F5A]/5"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 px-4 rounded-lg gradient-bg text-white font-semibold transition-smooth hover:shadow-glow"
              >
                Sign up
              </Link>
            </>
          ) : (
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="text-center py-3 px-4 rounded-lg gradient-bg text-white font-semibold transition-smooth hover:shadow-glow flex items-center justify-center gap-2"
            >
              <FiUser /> My Profile
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
