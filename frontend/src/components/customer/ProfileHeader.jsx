/**
 * ProfileHeader.jsx — User Banner Header Component
 */

import { FiMail, FiPhone, FiCalendar, FiCheckCircle } from 'react-icons/fi'

export default function ProfileHeader({ user }) {
  if (!user) return null

  const avatarUrl = user.avatar || user.imageUrl || null
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PM'

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Member'

  return (
    <div className="gradient-bg rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden mb-8 shadow-card">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name || 'User avatar'}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
              {initials}
            </div>
          )}
          {user.isVerified && (
            <div
              className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white"
              title="Verified Account"
            >
              <FiCheckCircle className="text-sm" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center sm:text-left flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.name || 'Food Explorer'}
            </h1>
            <span className="self-center sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
              {user.role || 'CUSTOMER'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-white/90 font-medium">
            {user.email && (
              <div className="flex items-center gap-1.5">
                <FiMail className="text-white/70" />
                <span>{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-1.5">
                <FiPhone className="text-white/70" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FiCalendar className="text-white/70" />
              <span>Joined {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
