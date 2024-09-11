# FullStack Test - Backend API

Este proyecto implementa una API backend para un sistema de pago de productos utilizando proveedor externo de pagos.

## Tecnologías Utilizadas

- Node.js con TypeScript
- Express.js
- MongoDB con Mongoose
- Arquitectura Hexagonal (Ports & Adapters)
- Jest para pruebas unitarias
- Proveedor externo API para procesamiento de pagos

## Estructura del Proyecto

El proyecto sigue una arquitectura hexagonal:

```
src/
├── application/
│   ├── ports/
│   ├── services/
│   └── use-cases/
├── domain/
│   ├── entities/
│   └── value-objects/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   ├── services/
│   └── web/
│       ├── controllers/
│       ├── middlewares/
│       └── routes/
├── config/
└── main.ts
```

## Configuración

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=3000
MONGODB_URI=
PROVIDER_API_KEY=
PROVIDER_PRIVATE_API_KEY=
PROVIDER_API_URL=
PROVIDER_SIGNATURE=
```

## Ejecución

- Desarrollo: `npm run dev`
- Producción: `npm start`
- Pruebas: `npm test`

## API Endpoints

### POST /api/payments/process

Procesa un pago para un producto.

**Cuerpo de la solicitud:**
```json
{
  "productId": "string",
  "quantity": number,
  "email": "string",
  "cardToken": "string"
}
```

**Respuesta:**
```json
{
  "status": "string",
  "transactionId": "string",
  "amount": number,
  "currency": "string",
  "reference": "string"
}
```

### GET /api/products/{id}

Obtiene los detalles de un producto.

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "stockQuantity": number
}
```

## Modelo de Datos

### Product
- id: string
- name: string
- description: string
- price: number
- stockQuantity: number

### Transaction
- id: string
- productId: string
- quantity: number
- status: string
- totalAmount: number
- providerTransactionId: string

## Seguridad

- Se implementa HTTPS para todas las comunicaciones.
- Las claves de API y tokens sensibles se almacenan como variables de entorno.
- Se utiliza el token de aceptación del Proveedor para cada transacción.
- Se implementa una firma de integridad para las transacciones.

## Manejo de Errores

La API utiliza códigos de estado HTTP apropiados y devuelve mensajes de error descriptivos.

## Pruebas

Se han implementado pruebas unitarias y de integración utilizando Jest. La cobertura de pruebas es superior al 80%.

Para ejecutar las pruebas: `npm test`

## Despliegue

La aplicación está desplegada en ZEABUR utilizando los siguientes servicios:
- Docker para el servidor de aplicaciones
- MongoDB para la base de datos

URL de la aplicación desplegada: https://product-paid-api.zeabur.app/api-docs/#/

## Consideraciones Adicionales

- La aplicación implementa un mecanismo de reintentos para verificar el estado final de las transacciones con Proveedor.
- Se utiliza un sistema de logging para facilitar el debugging y monitoreo.
- La aplicación es resistente a refrescos del navegador, manteniendo el estado de la transacción.

## Mejoras Futuras

- Implementar un sistema de caché para mejorar el rendimiento.
- Añadir autenticación de usuarios para un manejo más seguro de las transacciones.
- Implementar un sistema de notificaciones en tiempo real para actualizaciones de estado de las transacciones.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir qué te gustaría cambiar.

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)