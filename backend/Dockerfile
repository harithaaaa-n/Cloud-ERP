# ──────────────────────────────────────────────────────────────────────────────
# CloudERP Backend — Production-Grade Multi-Stage Dockerfile
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Dependency installer ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy manifests first for layer cache reuse
COPY package*.json ./
# --omit=dev installs only production dependencies
RUN npm ci --omit=dev

# ── Stage 2: Production runtime ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install wget for HEALTHCHECK (smallest footprint binary)
RUN apk add --no-cache wget

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create log directory owned by node user (non-root)
RUN mkdir -p logs && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health probe — /api/health is registered in index.js
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Drop root privileges
USER node

CMD ["node", "index.js"]
