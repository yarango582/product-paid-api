FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm ci
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]