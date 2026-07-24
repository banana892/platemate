/**
 * AuditLogsPage.jsx — Security & Administrative Action Audit Logs Page (Phase F4)
 */

import { useEffect, useState } from 'react'
import useSystemHealth from '../../hooks/useSystemHealth.js'
import SearchBar from '../../components/admin/common/SearchBar.jsx'
import UnifiedActivityTimeline from '../../components/admin/dashboard/UnifiedActivityTimeline.jsx'


export default function AuditLogsPage() {
  const { auditLogs, fetchLogs } = useSystemHealth()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs({ search })
  }, [fetchLogs, search])

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Security & Audit Logs</h1>
        <p className="text-xs text-slate-400">Complete audit trail of administrator actions, status changes, and settings modifications</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter audit logs by action or admin..." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">
            Audit Log Activity Table
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource Target</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs?.items?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-amber-400">{log.action}</td>
                    <td className="p-3 text-slate-200">{log.resource}</td>
                    <td className="p-3 text-slate-300">{log.admin}</td>
                    <td className="p-3 text-slate-500">{log.ip}</td>
                    <td className="p-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <UnifiedActivityTimeline auditLogs={auditLogs?.items} />
        </div>
      </div>
    </div>
  )
}
