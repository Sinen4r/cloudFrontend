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

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
