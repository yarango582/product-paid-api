/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from '../test-setup';
import { ProcessPaymentUseCase } from '../../application/use-cases/processPayment.use-case';
import { ProductService } from '../../infrastructure/services/product.service';
import { TransactionService } from '../../infrastructure/services/transaction.service';
import { ProviderPaymentService } from '../../infrastructure/services/paymentProvider.service';
import { Product } from '../../domain/entities/product.entity';

describe('Payment Flow Integration', () => {
  let processPaymentUseCase: ProcessPaymentUseCase;
  let productService: ProductService;
  let transactionService: TransactionService;
  let providerPaymentService: ProviderPaymentService;

  beforeEach(() => {
    processPaymentUseCase = Container.get(ProcessPaymentUseCase);
    productService = Container.get(ProductService);
    transactionService = Container.get(TransactionService);
    providerPaymentService = Container.get(ProviderPaymentService);
  });

  it('should process a payment end-to-end', async () => {
    // Crear un producto sin especificar un ID
    const productData = {
      name: 'Test Product',
      description: 'Description',
      price: 100,
      stockQuantity: 10,
    };
    const createdProduct = await (Container.get('ProductRepositoryPort') as any).create(
      productData,
    );

    // Simular el proceso de pago
    jest.spyOn(providerPaymentService, 'processPayment').mockResolvedValue({
      status: 'APPROVED',
      internalTransactionId: '123',
      externalTransactionId: 'ext123',
    });

    const result = await processPaymentUseCase.execute(createdProduct.id, 1, {
      token: 'token123',
      email: 'test@example.com',
    });

    expect(result.status).toBe('APPROVED');

    // Verificar que el stock se actualizó
    const updatedProduct = await productService.getProductById(createdProduct.id);
    expect(updatedProduct?.stockQuantity).toBe(9);

    // Verificar que la transacción se creó
    const transactions = await (Container.get('TransactionRepositoryPort') as any).find({
      product: createdProduct.id,
    });
    expect(transactions.length).toBe(1);
    expect(transactions[0].status).toBe('APPROVED');
  });

  it('should handle payment failure', async () => {
    // Crear un producto sin especificar un ID
    const productData = {
      name: 'Test Product 2',
      description: 'Description',
      price: 200,
      stockQuantity: 5,
    };
    const createdProduct = await (Container.get('ProductRepositoryPort') as any).create(
      productData,
    );

    // Simular un fallo en el pago
    jest
      .spyOn(providerPaymentService, 'processPayment')
      .mockRejectedValue(new Error('Payment failed'));

    const result = await processPaymentUseCase.execute(createdProduct.id, 1, {
      token: 'token123',
      email: 'test@example.com',
    });

    expect(result.status).toBe('FAILED');

    // Verificar que el stock no se actualizó
    const updatedProduct = await productService.getProductById(createdProduct.id);
    expect(updatedProduct?.stockQuantity).toBe(5);

    // Verificar que la transacción se creó con estado FAILED
    const transactions = await (Container.get('TransactionRepositoryPort') as any).find({
      product: createdProduct.id,
    });
    expect(transactions.length).toBe(1);
    expect(transactions[0].status).toBe('FAILED');
  });
});
