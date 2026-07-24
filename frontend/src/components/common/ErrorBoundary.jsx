import React from 'react'
import { useSelector } from 'react-redux'
import { getDashboardRoute } from '../../utils/constants.js'

/**
 * ErrorBoundaryInner — Class-based error boundary that receives the user's
 * role as a prop from the functional wrapper below. This avoids independently
 * reading the role from localStorage/JWT tokens (stale data).
 */
class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState)
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState)
  }

  handlePopState = () => {
    if (this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('PlateMate ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    // Use the user's current role from Redux (injected as a prop by the wrapper)
    const targetRoute = getDashboardRoute(this.props.userRole)
    window.location.href = targetRoute
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-card border border-gray-100 dark:border-slate-700 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center text-3xl mx-auto mb-4">
              💥
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              An unexpected error occurred in the application. We apologize for the inconvenience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-1/2 gradient-bg text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:shadow-glow transition-all focus-ring"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-1/2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all focus-ring"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * ErrorBoundary — Functional wrapper that reads the user's current role from
 * Redux and passes it as a prop to the class-based ErrorBoundaryInner.
 * This ensures the "Back to Home" button always navigates to the correct
 * role-specific dashboard using the single source of truth (Redux auth state).
 */
export function ErrorBoundary({ children }) {
  const user = useSelector((state) => state.auth.user)
  return (
    <ErrorBoundaryInner userRole={user?.role || null}>
      {children}
    </ErrorBoundaryInner>
  )
}

export default ErrorBoundary
