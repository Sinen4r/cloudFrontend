# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
# Runtime stage
FROM nginx:alpine

# Copy build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# OpenShift random UID permissions
RUN chmod -R g+rwx /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
