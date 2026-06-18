# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Native build tools required by better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install ALL dependencies (including devDependencies for TypeScript compilation)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and config files needed for the build
COPY tsconfig.json tsconfig.build.json ./
COPY src/ ./src/

# Compile TypeScript → dist/
RUN npm run build

# Remove devDependencies so only production deps are kept
RUN npm prune --omit=dev

# ─── Stage 2: runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy compiled output and pruned node_modules from builder
COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules

# SQLite database volume mount point
RUN mkdir -p /app/data

# Default environment variables (override at runtime as needed)
ENV NODE_ENV=production \
    DATABASE_PATH=/app/data/bot.db \
    PORT=3000

EXPOSE 3000

CMD ["node", "dist/main/server.js"]
