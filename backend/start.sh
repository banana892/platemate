#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# start.sh — Container Entrypoint for Railway/Docker Deployment
# ─────────────────────────────────────────────────────────────────────────────
#
# WHY THIS FILE EXISTS:
# Railway's start command override REPLACES Docker's CMD instruction entirely.
# If Railway is configured with only "prisma migrate deploy", the migration
# runs, exits with code 0, and the container stops — the Express server is
# never started. This script is used as the Docker ENTRYPOINT (which Railway
# does NOT override) to guarantee the full startup sequence always runs:
#   1. Prisma migrations (idempotent — safe to run on every deploy)
#   2. Express server (the actual application)
#
# WHY `set -e`?
# Exit immediately if any command returns a non-zero exit code.
# If migrations fail (bad schema, unreachable DB), the container exits
# immediately with a non-zero code — Railway marks the deploy as failed
# rather than starting a server against a broken database.
#
# WHY `exec node ...`?
# `exec` replaces the shell process with node, making Node PID 1.
# This is required for correct SIGTERM/SIGINT signal handling in Docker —
# without exec, signals go to the shell (PID 1), which forwards them
# inconsistently. Our graceful shutdown in server.js relies on SIGTERM.

set -e

echo "[BOOT] Starting PlateMate backend container..."
echo "[BOOT] NODE_ENV: ${NODE_ENV:-not set}"
echo "[BOOT] PORT: ${PORT:-not set}"

echo "[BOOT] Running Prisma migrations..."
npx prisma migrate deploy

echo "[BOOT] Migrations complete. Starting Express server..."
exec node src/server.js
