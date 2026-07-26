# Backend Dockerfile - Node.js + Express
# Multi-stage build for optimized image size

# ========================================
# BUILD STAGE
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Build TypeScript
RUN npm run build 2>/dev/null || echo "No build script, skipping"

# ========================================
# PRODUCTION STAGE
# ========================================
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application and prisma schema
COPY --from=builder /app/dist ./dist 2>/dev/null || true
COPY --from=builder /app/src ./src
COPY prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "-r", "ts-node/register", "src/index.ts"]
