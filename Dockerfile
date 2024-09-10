FROM node:22.2-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]