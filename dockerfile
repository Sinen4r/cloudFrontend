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
# Runtime stage
# -----------------------
FROM nginx:alpine

RUN chmod -R g+rwx /var/cache/nginx \
    /var/run \
    /var/log/nginx

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
