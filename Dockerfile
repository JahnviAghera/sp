FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production --no-cache --prefer-offline

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
