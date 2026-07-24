/**
 * AnnouncementForm.jsx — System Announcement Form Component (Phase F4)
 */

import { useState } from 'react'
import { FiSend } from 'react-icons/fi'

export default function AnnouncementForm({ onSend }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSend({ title, body, targetGroup: 'ALL' })
    setTitle('')
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-4">
      <div className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
        Broadcast Global Announcement
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Announcement Headline</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled System Upgrade Tonight"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Announcement Body</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Detailed broadcast message to all users..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-400"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
      >
        <FiSend /> Publish Global Announcement
      </button>
    </form>
  )
}
