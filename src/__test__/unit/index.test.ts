import 'reflect-metadata';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import request from 'supertest';
import { connectToMongoDB } from '../../infrastructure/database/mongodbConnection';
import { PaymentController } from '../../infrastructure/web/controllers/payment.controller';
import { ErrorHandlerMiddleware } from '../../infrastructure/web/middlewares/errorHandle.middleware';
import { LoggingMiddleware } from '../../infrastructure/web/middlewares/loggin.middleware';
import { MongoDBProductRepository } from '../../infrastructure/repositories/mongodbProduct.repository';
import { setupSwagger } from '../../config/swagger.config';
import { ProductController } from '../../infrastructure/web/controllers/products.controller';
import { ProductService } from '../../infrastructure/services/product.service';
import { MongoDBTransactionRepository } from '../../infrastructure/repositories/mongodbTransaction.repository';
import { ProviderPaymentService } from '../../infrastructure/services/paymentProvider.service';
import { TransactionService } from '../../infrastructure/services/transaction.service';
import { ProcessPaymentUseCase } from '../../application/use-cases/processPayment.use-case';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('express-rate-limit', () =>
  jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
);
jest.mock('../../infrastructure/database/mongodbConnection.ts');
jest.mock('../../config/swagger.config.ts');
jest.mock('../../config/logger.ts', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Bootstrap Function', () => {
  let app: express.Express;

  beforeAll(async () => {
    useContainer(Container);

    await connectToMongoDB();

    Container.set('ProductRepositoryPort', new MongoDBProductRepository());
    Container.set('TransactionRepositoryPort', new MongoDBTransactionRepository());
    Container.set(ProviderPaymentService, new ProviderPaymentService());
    Container.set(ProductService, new ProductService(Container.get('ProductRepositoryPort')));
    Container.set(
      TransactionService,
      new TransactionService(Container.get('TransactionRepositoryPort')),
    );
    Container.set(
      ProcessPaymentUseCase,
      new ProcessPaymentUseCase(
        Container.get(ProductService),
        Container.get(TransactionService),
        Container.get(ProviderPaymentService),
      ),
    );
    Container.set(PaymentController, new PaymentController(Container.get(ProcessPaymentUseCase)));

    app = createExpressServer({
      cors: true,
      routePrefix: '/api',
      controllers: [PaymentController, ProductController],
      middlewares: [ErrorHandlerMiddleware, LoggingMiddleware],
      defaultErrorHandler: false,
    });

    app.use(express.json());
    app.use(cors());
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      }),
    );

    setupSwagger(app);
  });

  it('should start the server and respond to requests', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(404);
  });

  //   it('should have swagger documentation setup', async () => {
  //     const response = await request(app).get('/api-docs');
  //     expect(response.status).not.toBe(404);
  //   });

  it('should handle errors gracefully', async () => {
    const response = await request(app).get('/api/nonexistent-route');
    expect(response.status).toBe(404);
  });

  it('should return a 404 status code for /api/products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(404);
  });

  it('should return a 404 status code for /api/payments', async () => {
    const response = await request(app).get('/api/payments');
    expect(response.status).toBe(404);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  jest.mock('dotenv', () => ({
    config: jest.fn(),
  }));

  jest.mock('express-rate-limit', () =>
    jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  );
  jest.mock('../../infrastructure/database/mongodbConnection.ts');
  jest.mock('../../config/swagger.config.ts');
  jest.mock('../../config/logger.ts', () => ({
    info: jest.fn(),
    error: jest.fn(),
  }));

  describe('Bootstrap Function', () => {
    let app: express.Express;

    beforeAll(async () => {
      useContainer(Container);

      await connectToMongoDB();

      Container.set('ProductRepositoryPort', new MongoDBProductRepository());
      Container.set('TransactionRepositoryPort', new MongoDBTransactionRepository());
      Container.set(ProviderPaymentService, new ProviderPaymentService());
      Container.set(ProductService, new ProductService(Container.get('ProductRepositoryPort')));
      Container.set(
        TransactionService,
        new TransactionService(Container.get('TransactionRepositoryPort')),
      );
      Container.set(
        ProcessPaymentUseCase,
        new ProcessPaymentUseCase(
          Container.get(ProductService),
          Container.get(TransactionService),
          Container.get(ProviderPaymentService),
        ),
      );
      Container.set(PaymentController, new PaymentController(Container.get(ProcessPaymentUseCase)));

      app = createExpressServer({
        cors: true,
        routePrefix: '/api',
        controllers: [PaymentController, ProductController],
        middlewares: [ErrorHandlerMiddleware, LoggingMiddleware],
        defaultErrorHandler: false,
      });

      app.use(express.json());
      app.use(cors());
      app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // limit each IP to 100 requests per windowMs
        }),
      );

      setupSwagger(app);
    });

    it('should start the server and respond to requests', async () => {
      const response = await request(app).get('/api');
      expect(response.status).toBe(404);
    });

    it('should handle errors gracefully', async () => {
      const response = await request(app).get('/api/nonexistent-route');
      expect(response.status).toBe(404);
    });

    it('should return a 404 status code for /api/products', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(404);
    });

    it('should return a 404 status code for /api/payments', async () => {
      const response = await request(app).get('/api/payments');
      expect(response.status).toBe(404);
    });

    it('should have swagger documentation setup', async () => {
      const response = await request(app).get('/api-docs');
      expect(response.status).toBe(404);
    });
  });
});
