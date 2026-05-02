# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --no-cache && npm cache clean --force

COPY . .
RUN npm run build

# Stage 2: Nginx serves frontend AND acts as Load Balancer for API
FROM nginx:alpine

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Note: nginx.conf is mounted via docker-compose volume for the load balancer config

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
