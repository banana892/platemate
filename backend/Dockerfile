# ─────────────────────────────────────────────────────────────────────────────
# PlateMate Backend — Production Multi-Stage Dockerfile
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# Installs all dependencies (including dev) so that Prisma CLI is available
# for the generate step. Source code is also copied here.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

# ── Stage 2: Production Runtime ───────────────────────────────────────────────
# Minimal image with only production dependencies.
# Prisma client is generated HERE to guarantee binary compatibility with the
# exact Node.js/Alpine version this image runs on.
FROM node:20-alpine AS runner

WORKDIR /app

# NODE_ENV signals production mode to Express, Prisma, and the logger.
# Do NOT hardcode PORT — Railway injects it dynamically at runtime via $PORT.
ENV NODE_ENV=production

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma schema into the runtime image and generate the client here.
# This is the correct pattern: generate in the same environment you run in.
COPY --from=builder /app/prisma ./prisma/
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
#   LEAVE EMPTY or set to empty string so Railway uses this ENTRYPOINT.
ENTRYPOINT ["sh", "start.sh"]
