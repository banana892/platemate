/**
 * NotificationCenter.jsx — Slide-out Panel for Real-Time System Alerts & Broadcasts (Phase F4)
 */

import { useState } from 'react'
import { FiX, FiBell, FiSend, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'
import useNotifications from '../../../hooks/useNotifications.js'

export default function NotificationCenter({ isOpen, onClose }) {
  const { notifications, broadcastNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('FEED') // FEED or BROADCAST
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetGroup, setTargetGroup] = useState('ALL')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    if (!title || !body) return
    setSubmitting(true)
    const success = await broadcastNotification({ title, body, targetGroup })
    setSubmitting(false)
    if (success) {
      setTitle('')
      setBody('')
      setActiveTab('FEED')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base">
              <FiBell className="text-amber-400" /> Notifications & Broadcasts
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-bold">
            <button
              onClick={() => setActiveTab('FEED')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'FEED'
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              System Feed ({notifications?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'BROADCAST'
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Send Broadcast
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'FEED' ? (
              notifications && notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-start gap-3">
                    {n.type === 'DISPUTE' ? (
                      <FiAlertTriangle className="text-amber-400 text-lg shrink-0 mt-0.5" />
                    ) : (
                      <FiCheckCircle className="text-emerald-400 text-lg shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-200 mb-1">{n.title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed mb-2">{n.body}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active system notifications
                </div>
              )
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Target Audience</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL">All Users (Global)</option>
                    <option value="CUSTOMERS">Customers Only</option>
                    <option value="PARTNERS">Restaurant Partners Only</option>
                    <option value="RIDERS">Delivery Riders Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Scheduled System Maintenance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    placeholder="Write announcement message..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <FiSend /> {submitting ? 'Broadcasting...' : 'Broadcast Push Notification'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
