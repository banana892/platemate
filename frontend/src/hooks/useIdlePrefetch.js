import { useEffect } from 'react'

export function useIdlePrefetch() {
  useEffect(() => {
    const prefetchRoutes = () => {
      // Prefetch high frequency route chunks after initial page load during idle time
      import('../pages/customer/Restaurants.jsx').catch(() => {})
      import('../pages/customer/Cart.jsx').catch(() => {})
      import('../pages/auth/Login.jsx').catch(() => {})
    }

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(prefetchRoutes, { timeout: 3000 })
      return () => window.cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(prefetchRoutes, 2000)
      return () => clearTimeout(timer)
    }
  }, [])
}

export default useIdlePrefetch
