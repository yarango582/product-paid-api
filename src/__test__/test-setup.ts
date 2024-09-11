import { Container } from 'typedi';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ProductService } from '../infrastructure/services/product.service';
import { TransactionService } from '../infrastructure/services/transaction.service';
import { ProviderPaymentService } from '../infrastructure/services/paymentProvider.service';
import { ProcessPaymentUseCase } from '../application/use-cases/processPayment.use-case';
import { MongoDBProductRepository } from '../infrastructure/repositories/mongodbProduct.repository';
import { MongoDBTransactionRepository } from '../infrastructure/repositories/mongodbTransaction.repository';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

export { Container };
