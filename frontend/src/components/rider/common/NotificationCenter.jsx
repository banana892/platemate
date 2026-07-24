/**
 * NotificationCenter.jsx — Persistent Rider Notification Drawer (Phase F3)
 */

import { useState } from 'react'
import { FiBell, FiCheckCircle, FiPackage, FiInfo, FiX } from 'react-icons/fi'

export default function NotificationCenter({
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkRead,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors focus:outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white font-extrabold text-[0.65rem] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiBell className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onMarkAllRead) onMarkAllRead()
                    }}
                    className="text-[0.7rem] text-orange-400 hover:underline font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-gray-400 space-y-2">
                  <FiCheckCircle className="w-8 h-8 mx-auto text-emerald-400" />
                  <p className="text-xs font-semibold">You're all caught up!</p>
                  <p className="text-[0.7rem]">No notifications to display.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id || Math.random()}
                    onClick={() => {
                      if (!n.isRead && onMarkRead) onMarkRead(n.id)
                    }}
                    className={`p-3 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-orange-50/60 border-l-4 border-orange-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shrink-0">
                      {n.type === 'NEW_ASSIGNMENT' ? (
                        <FiPackage className="w-4 h-4" />
                      ) : (
                        <FiInfo className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-900">{n.title || 'Notification'}</h4>
                        <span className="text-[0.65rem] text-gray-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
