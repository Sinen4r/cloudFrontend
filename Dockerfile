# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build frontend
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# OpenShift runs containers as random UID
RUN chmod -R g+rwx /usr/share/nginx/html \
    && chmod -R g+rwx /var/cache/nginx \
    && chmod -R g+rwx /var/run

EXPOSE 8080

# OpenShift expects port 8080
CMD ["nginx", "-g", "daemon off;"]
