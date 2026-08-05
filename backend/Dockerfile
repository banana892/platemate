# ─────────────────────────────────────────────────────────────────────────────
# PlateMate Backend — Production Multi-Stage Dockerfile
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# Installs all dependencies (including dev) so that Prisma CLI is available.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# ── PRISMA 7 REQUIREMENT ──────────────────────────────────────────────────────
# prisma.config.ts is the ONLY source of datasource.url in Prisma 7.
# The schema.prisma datasource block does NOT contain url (Prisma 7 rejects it).
# This file must be present in every stage that runs a Prisma CLI command.
COPY prisma.config.ts ./

RUN npm ci

# prisma.config.ts is present here → generate reads it for schema path resolution.
# DATABASE_URL is not needed at generate time (no DB connection, just codegen).
RUN npx prisma generate

COPY src ./src

# ── Stage 2: Production Runtime ───────────────────────────────────────────────
# Minimal image with only production dependencies.
FROM node:20-alpine AS runner

WORKDIR /app

# NODE_ENV signals production mode to Express, Prisma, and the logger.
# Do NOT hardcode PORT — Railway injects it dynamically at runtime via $PORT.
ENV NODE_ENV=production

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma artefacts from builder
COPY --from=builder /app/prisma ./prisma/

# ── PRISMA 7 REQUIREMENT ──────────────────────────────────────────────────────
# prisma.config.ts must exist at WORKDIR (/app) when start.sh runs
# `npx prisma migrate deploy` at container startup.
# Without it, Prisma 7 cannot resolve datasource.url and throws:
#   "The datasource.url property is required in your Prisma config file."
COPY --from=builder /app/prisma.config.ts ./

# Generate Prisma client in the runtime environment.
# prisma.config.ts is present → schema path is resolved correctly.
# DATABASE_URL is not required at generate time.
RUN npx prisma generate

# Copy application source code
COPY --from=builder /app/src ./src

# Copy the container entrypoint script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# EXPOSE is informational metadata only.
# Railway assigns the actual port dynamically via the $PORT environment variable.
EXPOSE 8080

# ── WHY ENTRYPOINT AND NOT CMD ────────────────────────────────────────────────
# Railway's "start command" setting overrides Docker's CMD, but NOT ENTRYPOINT.
# By using ENTRYPOINT, we guarantee that start.sh ALWAYS runs regardless of
# what Railway's dashboard has configured as the start command.
#
# start.sh runs: prisma migrate deploy → exec node src/server.js
#
# Railway Dashboard → Service → Settings → Start Command:
#   LEAVE EMPTY so Railway uses this ENTRYPOINT.
ENTRYPOINT ["sh", "start.sh"]
