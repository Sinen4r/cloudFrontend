# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Install serve to run static files
RUN npm install -g serve

# Expose port 8080
EXPOSE 8080

# Run on port 8080 for OpenShift
CMD ["serve", "-s", "build", "-l", "8080"]