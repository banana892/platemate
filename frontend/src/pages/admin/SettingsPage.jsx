/**
 * SettingsPage.jsx — Platform Operations & Feature Flag Settings Page (Phase F4)
 */

import { useEffect } from 'react'
import useSystemHealth from '../../hooks/useSystemHealth.js'
import PlatformSettingsForm from '../../components/admin/settings/PlatformSettingsForm.jsx'
import FeatureFlagManager from '../../components/admin/settings/FeatureFlagManager.jsx'
import SystemStatusCard from '../../components/admin/settings/SystemStatusCard.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function SettingsPage() {
  const {
    settings,
    featureFlags,
    fetchFlags,
    fetchSettings,
    toggleFeatureFlag,
    updateSettings,
  } = useSystemHealth()

  useEffect(() => {
    fetchFlags()
    fetchSettings()
  }, [fetchFlags, fetchSettings])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Platform Operational Settings</h1>
        <p className="text-xs text-slate-400">Configure platform fees, feature flag switches, and maintenance modes</p>
      </div>

      {/* Maintenance Mode Emergency Switch */}
      <SystemStatusCard
        maintenanceMode={settings?.maintenanceMode || false}
        onToggleMode={(mode) => updateSettings({ ...settings, maintenanceMode: mode })}
      />

      {/* Feature Flag Management Board */}
      <FeatureFlagManager flags={featureFlags} onToggle={toggleFeatureFlag} />

      {/* Platform Fees & Rules Form */}
      {settings ? (
        <PlatformSettingsForm settings={settings} onSave={updateSettings} />
      ) : (
        <Skeleton variant="card" className="h-64" />
      )}
    </div>
  )
}
