import { Link } from 'react-router-dom'
import { FiHome, FiSearch } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth.js'
import { getDashboardRoute } from '../utils/constants.js'

export function NotFoundPage() {
  const { user } = useAuth()
  const homeRoute = getDashboardRoute(user?.role)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] dark:bg-slate-900 pt-20 pb-12 px-4">
      <div className="text-center max-w-lg w-full bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-card border border-gray-100 dark:border-slate-700 animate-scale-in">
        <div className="text-8xl font-black gradient-text mb-2">404</div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={homeRoute}
            className="w-full sm:w-auto gradient-bg text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-glow transition-all focus-ring"
          >
            <FiHome /> Go to Home
          </Link>
          <Link
            to="/restaurants"
            className="w-full sm:w-auto bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all focus-ring"
          >
            <FiSearch /> Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
