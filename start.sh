#!/usr/bin/env bash
# ── CloudERP Dev Starter ──────────────────────────────────────────────
# Forces Node 20 (via nvm) so the backend ESM + jsonwebtoken works
# Usage: bash start.sh
# ─────────────────────────────────────────────────────────────────────

NODE20=~/.nvm/versions/node/v20.20.2/bin
export PATH="$NODE20:$PATH"

echo "✅ Using Node: $(node --version)  NPM: $(npm --version)"
echo "🚀 Starting CloudERP (backend:5000 · frontend:3000)..."

npm run dev
