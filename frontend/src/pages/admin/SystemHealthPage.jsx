/**
 * SystemHealthPage.jsx — Infrastructure Monitoring & Service Status Page (Phase F4)
 */

import { useEffect } from 'react'
import useSystemHealth from '../../hooks/useSystemHealth.js'
import { FiCheckCircle, FiActivity, FiCpu, FiHardDrive, FiServer } from 'react-icons/fi'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function SystemHealthPage() {
  const { systemHealth, fetchHealth } = useSystemHealth()

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  if (!systemHealth) {
    return <Skeleton variant="card" className="h-64" />
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">System Infrastructure Health</h1>
          <p className="text-xs text-slate-400">Real-time health telemetry for APIs, Database, Redis, Sockets & Queues</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 text-xs w-fit">
          <FiCheckCircle className="animate-pulse" /> All Systems Operational
        </span>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemHealth.services?.map((svc, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <FiServer className="text-amber-400" /> {svc.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                {svc.status}
              </span>
            </div>
            <div className="text-slate-400">{svc.message}</div>
            <div className="text-[11px] font-mono text-amber-400">Latency: {svc.latencyMs} ms</div>
          </div>
        ))}
      </div>

      {/* Hardware Resource Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
          Server Resources & Utilization
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span className="flex items-center gap-1.5"><FiCpu className="text-amber-400" /> CPU Usage</span>
              <span className="text-amber-400 font-mono">{systemHealth.resources?.cpuUsagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div style={{ width: `${systemHealth.resources?.cpuUsagePercent}%` }} className="h-full bg-amber-500 rounded-full" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span className="flex items-center gap-1.5"><FiActivity className="text-emerald-400" /> RAM Memory</span>
              <span className="text-emerald-400 font-mono">{systemHealth.resources?.memoryUsagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div style={{ width: `${systemHealth.resources?.memoryUsagePercent}%` }} className="h-full bg-emerald-500 rounded-full" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span className="flex items-center gap-1.5"><FiHardDrive className="text-indigo-400" /> Disk Storage</span>
              <span className="text-indigo-400 font-mono">{systemHealth.resources?.storageUsagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div style={{ width: `${systemHealth.resources?.storageUsagePercent}%` }} className="h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
