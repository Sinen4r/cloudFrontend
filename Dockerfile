# frontend/Dockerfile
# Single stage - simpler
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Switch to non-root user BEFORE installing serve
RUN adduser -D -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Install serve as non-root user (avoids permission issues)
RUN npm install -g serve

EXPOSE 8080

# Serve the app
CMD ["serve", "-s", "dist", "-l", "8080"]