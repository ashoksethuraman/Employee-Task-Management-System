# Frontend Dockerfile - React + Vite + Nginx
# Multi-stage build for optimized image size

# ========================================
# BUILD STAGE
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

# Copy source code
COPY src ./src
COPY public ./public

# Install dependencies
RUN npm ci

# Build for production
RUN npm run build

# ========================================
# PRODUCTION STAGE (Nginx)
# ========================================
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Install curl for health check
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
