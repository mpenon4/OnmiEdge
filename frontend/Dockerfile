# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
