import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProductService } from '../../../infrastructure/services/product.service';
import { TransactionService } from '../../../infrastructure/services/transaction.service';
import { ProviderPaymentService } from '../../../infrastructure/services/paymentProvider.service';
import { Product } from '../../../domain/entities/product.entity';

describe('ProcessPaymentUseCase', () => {
  let processPaymentUseCase: ProcessPaymentUseCase;
  let productServiceMock: jest.Mocked<ProductService>;
  let transactionServiceMock: jest.Mocked<TransactionService>;
  let paymentServiceMock: jest.Mocked<ProviderPaymentService>;

  beforeEach(() => {
    productServiceMock = {
      getProductById: jest.fn(),
      updateProductStock: jest.fn(),
    } as any;

    transactionServiceMock = {
      createTransaction: jest.fn(),
      updateTransactionStatus: jest.fn(),
    } as any;

    paymentServiceMock = {
      processPayment: jest.fn(),
    } as any;

    processPaymentUseCase = new ProcessPaymentUseCase(
      productServiceMock,
      transactionServiceMock,
      paymentServiceMock,
    );
  });

  it('debería procesar el pago exitosamente', async () => {
    const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 10);
    productServiceMock.getProductById.mockResolvedValue(mockProduct);
    transactionServiceMock.createTransaction.mockResolvedValue({
      _id: '123',
      status: 'PENDING',
    } as any);
    paymentServiceMock.processPayment.mockResolvedValue({
      status: 'APPROVED',
      internalTransactionId: '123',
      externalTransactionId: 'ext123',
    });

    const result = await processPaymentUseCase.execute('1', 1, {
      token: 'token123',
      email: 'test@example.com',
    });

    expect(result.status).toBe('APPROVED');
    expect(result.internalTransactionId).toBe('123');
    expect(productServiceMock.updateProductStock).toHaveBeenCalledWith('1', 1);
    expect(transactionServiceMock.updateTransactionStatus).toHaveBeenCalledWith('123', 'APPROVED');
  });

  it('debería lanzar un error por stock insuficiente', async () => {
    const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 1);
    productServiceMock.getProductById.mockResolvedValue(mockProduct);

    await expect(
      processPaymentUseCase.execute('1', 2, { token: 'token123', email: 'test@example.com' }),
    ).rejects.toThrow('Insufficient stock');
  });

  it('debería manejar el fallo del pago', async () => {
    const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 10);
    productServiceMock.getProductById.mockResolvedValue(mockProduct);
    transactionServiceMock.createTransaction.mockResolvedValue({
      _id: '123',
      status: 'PENDING',
    } as any);
    paymentServiceMock.processPayment.mockResolvedValue({
      status: 'FAILED',
      internalTransactionId: '123',
    });

    const result = await processPaymentUseCase.execute('1', 1, {
      token: 'token123',
      email: 'test@example.com',
    });

    expect(result.status).toBe('FAILED');
    expect(transactionServiceMock.updateTransactionStatus).toHaveBeenCalledWith('123', 'FAILED');
  });

  describe('ProcessPaymentUseCase', () => {
    let processPaymentUseCase: ProcessPaymentUseCase;
    let productServiceMock: jest.Mocked<ProductService>;
    let transactionServiceMock: jest.Mocked<TransactionService>;
    let paymentServiceMock: jest.Mocked<ProviderPaymentService>;

    beforeEach(() => {
      productServiceMock = {
        getProductById: jest.fn(),
        updateProductStock: jest.fn(),
      } as any;

      transactionServiceMock = {
        createTransaction: jest.fn(),
        updateTransactionStatus: jest.fn(),
      } as any;

      paymentServiceMock = {
        processPayment: jest.fn(),
      } as any;

      processPaymentUseCase = new ProcessPaymentUseCase(
        productServiceMock,
        transactionServiceMock,
        paymentServiceMock,
      );
    });

    it('debería procesar el pago exitosamente', async () => {
      const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 10);
      productServiceMock.getProductById.mockResolvedValue(mockProduct);
      transactionServiceMock.createTransaction.mockResolvedValue({
        _id: '123',
        status: 'PENDING',
      } as any);
      paymentServiceMock.processPayment.mockResolvedValue({
        status: 'APPROVED',
        internalTransactionId: '123',
        externalTransactionId: 'ext123',
      });

      const result = await processPaymentUseCase.execute('1', 1, {
        token: 'token123',
        email: 'test@example.com',
      });

      expect(result.status).toBe('APPROVED');
      expect(result.internalTransactionId).toBe('123');
      expect(productServiceMock.updateProductStock).toHaveBeenCalledWith('1', 1);
      expect(transactionServiceMock.updateTransactionStatus).toHaveBeenCalledWith(
        '123',
        'APPROVED',
      );
    });

    it('debería lanzar un error por stock insuficiente', async () => {
      const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 1);
      productServiceMock.getProductById.mockResolvedValue(mockProduct);

      await expect(
        processPaymentUseCase.execute('1', 2, { token: 'token123', email: 'test@example.com' }),
      ).rejects.toThrow('Insufficient stock');
    });

    it('debería manejar el fallo del pago', async () => {
      const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 10);
      productServiceMock.getProductById.mockResolvedValue(mockProduct);
      transactionServiceMock.createTransaction.mockResolvedValue({
        _id: '123',
        status: 'PENDING',
      } as any);
      paymentServiceMock.processPayment.mockResolvedValue({
        status: 'FAILED',
        internalTransactionId: '123',
      });

      const result = await processPaymentUseCase.execute('1', 1, {
        token: 'token123',
        email: 'test@example.com',
      });

      expect(result.status).toBe('FAILED');
      expect(transactionServiceMock.updateTransactionStatus).toHaveBeenCalledWith('123', 'FAILED');
    });

    it('debería lanzar un error si el producto no se encuentra', async () => {
      productServiceMock.getProductById.mockResolvedValue(null);

      await expect(
        processPaymentUseCase.execute('1', 1, { token: 'token123', email: 'test@example.com' }),
      ).rejects.toThrow('Product not found');
    });

    it('debería manejar excepciones durante el procesamiento del pago', async () => {
      const mockProduct = new Product('1', 'Producto de Prueba', 'Descripción', 100, 10);
      productServiceMock.getProductById.mockResolvedValue(mockProduct);
      transactionServiceMock.createTransaction.mockResolvedValue({
        _id: '123',
        status: 'PENDING',
      } as any);
      paymentServiceMock.processPayment.mockRejectedValue(new Error('Payment processing error'));

      const result = await processPaymentUseCase.execute('1', 1, {
        token: 'token123',
        email: 'test@example.com',
      });

      expect(result.status).toBe('FAILED');
      expect(result.internalTransactionId).toBe('123');
      expect(transactionServiceMock.updateTransactionStatus).toHaveBeenCalledWith('123', 'FAILED');
    });
  });
});
