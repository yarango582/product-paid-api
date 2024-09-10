# Node.js 18 LTS
FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --only=production

# Copia el resto de los archivos del proyecto
COPY . .

# Compila la aplicación TypeScript
RUN npm run build

# Ejecuta los seeds
RUN npm run seed:production

# Expone el puerto que usará la aplicación
EXPOSE 3000

# Establece las variables de entorno
ENV NODE_ENV=production

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]

# HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
