/**
 * authLogger.js — Development-Only Authentication Diagnostics Logger
 *
 * Lightweight debug logger that records auth lifecycle events, leader election,
 * lock state, queue sizes, and cross-tab synchronization.
 *
 * Automatically disabled in production builds (import.meta.env.DEV === false).
 */

const IS_DEV = import.meta.env.DEV

const formatTime = () => new Date().toISOString().substring(11, 23)

const log = (badge, message, data) => {
  if (!IS_DEV) return
  const prefix = `%c[AuthDebug]%c %c[${badge}]%c`
  const styles = [
    'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    '',
    'background: #334155; color: #f8fafc; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    '',
  ]
  if (data !== undefined) {
    console.log(prefix, ...styles, `${formatTime()} - ${message}`, data)
  } else {
    console.log(prefix, ...styles, `${formatTime()} - ${message}`)
  }
}

export const authLogger = {
  leaderElection: (status, data) => log('LeaderElection', status, data),
  lockEvent: (action, data) => log('LockState', action, data),
  refreshResult: (status, data) => log('RefreshResult', status, data),
  queueState: (action, size) => log('RequestQueue', `${action} (Queue size: ${size})`),
  sessionChange: (oldId, newId) => log('SessionChange', `Session ID bumped from ${oldId} to ${newId}`),
  tabSync: (type, data) => log('TabSync', `Received event: ${type}`, data),
  logoutPropagation: (source) => log('Logout', `Logout triggered via ${source}`),
}

export default authLogger
