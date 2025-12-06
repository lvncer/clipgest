# Multi-stage Dockerfile for QuickLinks web (Next.js)
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY web/package.json ./
RUN npm install

# Copy application source
COPY web ./

# Build Next.js app (Clerk keys are loaded from web/.env.local during build)
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built app and node_modules from builder
COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "run", "start"]
