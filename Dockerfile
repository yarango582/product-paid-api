# Node.js 18 LTS
FROM node:18-alpine AS builder

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala todas las dependencias, incluyendo las de desarrollo
RUN npm ci

# Copia el resto de los archivos del proyecto
COPY . .

# Compila la aplicación TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Instala solo las dependencias de producción
RUN npm ci --only=production

# Copia los archivos compilados y otros archivos necesarios desde la etapa de construcción
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/scripts ./src/scripts

# Ejecuta los seeds
RUN npm run seed:production

# Expone el puerto que usará la aplicación
EXPOSE 3000

# Establece las variables de entorno
ENV NODE_ENV=production

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]

# Healthcheck para verificar que la aplicación está funcionando
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1