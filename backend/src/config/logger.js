/**
 * logger.js — Pino Logger Configuration
 *
 * WHY PINO OVER CONSOLE.LOG?
 * console.log is synchronous and blocks the event loop. In production under
 * load, this can kill throughput. Pino uses asynchronous, line-buffered output
 * and emits structured JSON — so every log entry can be parsed, filtered, and
 * shipped to log aggregators (Datadog, Logtail, etc.) automatically.
 *
 * WHY STRUCTURED LOGGING?
 * Searching "ERROR" in plain text logs doesn't scale. With JSON logs, you
 * can query: level=error AND service=restaurant AND userId=xxx
 * This is how real production systems handle logging.
 *
 * PRETTY PRINTING:
 * In development, pino-pretty formats the JSON into human-readable output.
 * In production, we emit raw JSON — faster and compatible with log shippers.
 */

import pino from 'pino'
import { isDev, env } from './env.js'

const logger = pino({
  level: isDev ? 'debug' : 'info',

  // Structured base fields — every log line gets these
  base: {
    pid: process.pid,
    service: 'platemate-api',
    env: env.NODE_ENV,
  },

  // Timestamp in ISO format for log aggregators
  timestamp: pino.stdTimeFunctions.isoTime,

  // Pretty print in development only
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,service,env',
        messageFormat: '{msg}',
      },
    },
  }),
})

export default logger
