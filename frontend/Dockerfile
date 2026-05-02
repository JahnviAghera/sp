# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --no-cache && npm cache clean --force

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx (tiny, no Node.js)
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
