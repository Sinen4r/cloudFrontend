# -----------------------
# Build stage
# -----------------------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# -----------------------
# Runtime stage
# -----------------------
FROM nginx:alpine

# OpenShift runs containers with random UID → fix permissions
RUN chmod -R g+rwx /var/cache/nginx \
    /var/run \
    /var/log/nginx

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Nginx listens on 80 by default, OpenShift maps it to 8080
CMD ["nginx", "-g", "daemon off;"]
