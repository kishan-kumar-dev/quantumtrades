# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache bash libc6-compat openssl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Run Next.js production server
CMD ["npm", "start"]
