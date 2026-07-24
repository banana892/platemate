import { useState, useEffect } from 'react'

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
      setShowRestored(true)
      const timer = setTimeout(() => setShowRestored(false), 3000)
      return () => clearTimeout(timer)
    }

    function handleOffline() {
      setIsOffline(true)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOffline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed bottom-4 right-4 z-[300] bg-red-600 text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 animate-bounce-slow"
      >
        <span>📡</span>
        <span>You are currently offline. Check your connection.</span>
      </div>
    )
  }

  if (showRestored) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[300] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 animate-fade-in"
      >
        <span>✅</span>
        <span>Internet connection restored.</span>
      </div>
    )
  }

  return null
}

export default NetworkStatus
