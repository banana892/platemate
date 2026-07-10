export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
          <div className="h-48 animate-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 rounded-md animate-shimmer" />
            <div className="h-4 w-1/2 rounded-md animate-shimmer" />
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded-md animate-shimmer" />
              <div className="h-4 w-20 rounded-md animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-card">
          <div className="w-28 h-24 rounded-xl animate-shimmer shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-2/3 rounded-md animate-shimmer" />
            <div className="h-4 w-1/3 rounded-md animate-shimmer" />
            <div className="h-4 w-full rounded-md animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-3 border-gray-200 border-t-[#FF4F5A] rounded-full animate-spin`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF4F5A] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}
