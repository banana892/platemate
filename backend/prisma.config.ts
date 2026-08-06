/**
 * prisma.config.ts — Prisma v7 Configuration
 *
 * Prisma v7 moved the database URL out of schema.prisma into this config file.
 * This gives you more flexibility — you can use TypeScript logic, secret managers,
 * or any dynamic source for your connection string.
 *
 * For migrations (CLI operations), Prisma reads this file.
 * For the runtime client (application code), you still use PrismaClient in config/db.js.
 *
 * IMPORTANT: This file is TypeScript — that's why it's .ts even in a JS project.
 * Prisma CLI handles TS natively for config files.
 */

import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
  },
})
