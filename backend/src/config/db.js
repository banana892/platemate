/**
 * db.js — Prisma v7 Client Singleton
 *
 * WHY A SINGLETON?
 * In development with hot-reload (nodemon), each file re-import creates a NEW
 * PrismaClient instance. Each instance opens its own connection pool. After a
 * few reloads you'll hit PostgreSQL's max_connections limit (default: 100).
 *
 * Solution: attach the client to the global object in development so it
 * survives hot reloads. In production, Node process doesn't hot-reload,
 * so a module-level singleton is fine.
 *
 * PRISMA v7 NOTE:
 * In Prisma v7, the DATABASE_URL for CLI operations (migrations) lives in
 * prisma.config.ts. However, the runtime PrismaClient reads it from the
 * environment directly (DATABASE_URL env var). This is set in our .env file
 * and loaded by dotenv/config in server.js.
 *
 * With the "client" engine (default in v7), you must provide either:
 *   - adapter (for edge environments)
 *   - or use the standard env-based connection (which requires DATABASE_URL)
 *
 * We use the pg adapter for standard PostgreSQL in Node.js.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { isDev } from './env.js'

const globalForPrisma = globalThis

const createPrismaClient = () => {
  // Use pg adapter — required for Prisma v7's "client" engine type
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

  const client = new PrismaClient({
    adapter,
    log: isDev
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
  })

  if (isDev) {
    // Log SQL queries in development — invaluable for catching N+1 queries
    client.$on('query', (e) => {
      if (process.env.DEBUG_SQL) {
        console.log('Query: ' + e.query)
        console.log('Params: ' + e.params)
        console.log('Duration: ' + e.duration + 'ms')
      }
    })
  }

  return client
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (isDev) {
  globalForPrisma.prisma = prisma
}

export default prisma
