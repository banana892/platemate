#!/usr/bin/env bash
set -e

echo "=================================================="
echo "      PlateMate Security & Audit Runner          "
echo "=================================================="

echo "🔍 1. Running npm audit on backend..."
cd /home/naishring/platemate/backend
npm audit --audit-level=high

echo "🔍 2. Running npm audit on frontend..."
cd /home/naishring/platemate/frontend
npm audit --audit-level=high

echo "🔒 3. Running security integration test suite..."
cd /home/naishring/platemate/backend
npm run test:security

echo "✅ Security and audit checks passed cleanly!"
