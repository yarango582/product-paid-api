import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './config/logger';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { connectToMongoDB } from './infrastructure/database/mongodbConnection';
import { PaymentController } from './infrastructure/web/controllers/payment.controller';
import { ErrorHandlerMiddleware } from './infrastructure/web/middlewares/errorHandle.middleware';
import { LoggingMiddleware } from './infrastructure/web/middlewares/loggin.middleware';
// import { ProviderPaymentService } from './infrastructure/services/paymentProvider.service';
import { MongoDBProductRepository } from './infrastructure/repositories/mongodbProduct.repository';
// import { MongoDBTransactionRepository } from './infrastructure/repositories/mongodbTransaction.repository';
// import { ProcessPaymentUseCase } from './application/use-cases/processPayment.use-case';
import { setupSwagger } from './config/swagger.config';
import { ProductController } from './infrastructure/web/controllers/products.controller';
import { ProductService } from './infrastructure/services/product.service';
import { MongoDBTransactionRepository } from './infrastructure/repositories/mongodbTransaction.repository';
import { ProviderPaymentService } from './infrastructure/services/paymentProvider.service';
import { TransactionService } from './infrastructure/services/transaction.service';
import { ProcessPaymentUseCase } from './application/use-cases/processPayment.use-case';

useContainer(Container);

async function bootstrap() {
  try {
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

    const app = createExpressServer({
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

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Swagger documentation is available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start the server', { error });
    process.exit(1);
  }
}

bootstrap();
