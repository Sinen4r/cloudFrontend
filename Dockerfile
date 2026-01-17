# -------- Build stage --------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# -------- Runtime stage --------
FROM nginx:1.25-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# OpenShift non-root permissions
RUN chmod -R g+rwx /usr/share/nginx/html \
    /var/cache/nginx \
    /var/run

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
