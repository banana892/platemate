/**
 * NotificationsPage.jsx — Announcements & Push Notifications Center Page (Phase F4)
 */

import useNotifications from '../../hooks/useNotifications.js'
import AnnouncementForm from '../../components/admin/settings/AnnouncementForm.jsx'
import { FiBell, FiCheckCircle } from 'react-icons/fi'

export default function NotificationsPage() {
  const { notifications, broadcastNotification } = useNotifications()

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Announcements & Push Notifications</h1>
        <p className="text-xs text-slate-400">Broadcast maintenance alerts, system messages, and promotional notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnnouncementForm onSend={broadcastNotification} />

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            <FiBell className="text-amber-400" /> Notification Broadcast History
          </div>

          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <FiCheckCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-200">{n.title}</div>
                    <div className="text-slate-400 mt-1">{n.body}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No notification broadcast records
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
