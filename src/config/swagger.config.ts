import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Product Paid API',
    version: '1.0.0',
    description: 'API for processing payments and managing products',
  },
  paths: {
    '/api/payments/process': {
      post: {
        summary: 'Process a payment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                  },
                  quantity: {
                    type: 'number',
                  },
                  cardToken: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Payment processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    internalTransactionId: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' },
                    reference: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/card/validate': {
      post: {
        summary: 'Validate a card',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  number: {
                    type: 'string',
                  },
                  cvc: {
                    type: 'string',
                  },
                  expMonth: {
                    type: 'string',
                  },
                  expYear: {
                    type: 'string',
                  },
                  cardHolder: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Card is valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        brand: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Failed to validate card',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/payments/': {
      get: {
        summary: 'Get all transactions',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      productId: { type: 'string' },
                      quantity: { type: 'number' },
                      amount: { type: 'number' },
                      status: { type: 'string' },
                      paymentDate: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'No transactions found',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    stockQuantity: { type: 'number' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Product not found',
          },
        },
      },
    },
    '/api/products': {
      get: {
        summary: 'Get all products',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'number' },
                      stockQuantity: { type: 'number' },
                      publicImageUrl: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
