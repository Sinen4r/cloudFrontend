# -----------------------
# Build stage
# -----------------------
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# -----------------------
# Runtime stage (OpenShift-safe)
# -----------------------
FROM nginxinc/nginx-unprivileged:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom config (still required for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
