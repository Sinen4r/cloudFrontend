# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist

# Copy server.js
COPY --from=builder /app/server.js ./

# Install only production dependencies
RUN npm install express

EXPOSE 8080

CMD ["node", "server.js"]