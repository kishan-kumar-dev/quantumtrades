# ----------------------------
# 1. Base image
# ----------------------------
FROM node:20-alpine AS base
WORKDIR /app

# Install OS deps required by Prisma (SQLite, OpenSSL)
RUN apk add --no-cache bash libc6-compat openssl

# ----------------------------
# 2. Dependencies layer
# ----------------------------
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ----------------------------
# 3. Builder layer
# ----------------------------
FROM deps AS builder
COPY . .
# Prisma client must be generated *after* schema is copied
RUN npx prisma generate
RUN npm run build

# ----------------------------
# 4. Production runner
# ----------------------------
FROM base AS runner
ENV NODE_ENV=production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy only what’s needed for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# If using SQLite, ensure DB file persists
VOLUME ["/app/prisma"]

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
