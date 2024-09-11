import 'reflect-metadata';
import { PaymentController } from '../../../infrastructure/web/controllers/payment.controller';
import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProcessPaymentDto } from '../../../application/dtos/processPayment.dto';
import { Response } from 'express';
import { Container } from 'typedi';
import { IPaymentServiceResponse } from '../../../application/ports/services/payment.service';
import { TransactionService } from '../../../infrastructure/services/transaction.service';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let processPaymentUseCase: jest.Mocked<ProcessPaymentUseCase>;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(() => {
    processPaymentUseCase = {
      execute: jest.fn(),
    } as any;

    transactionService = {
      createTransaction: jest.fn(),
      updateTransactionStatus: jest.fn(),
      find: jest.fn(),
    } as any;

    Container.set(ProcessPaymentUseCase, processPaymentUseCase);
    Container.set(TransactionService, transactionService);
    paymentController = new PaymentController(processPaymentUseCase, transactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should return transaction data when payment is processed successfully', async () => {
      const paymentData: ProcessPaymentDto = {
        productId: 'product123',
        quantity: 2,
        cardToken: 'card_token_123',
        email: 'test@example.com',
        paymentDetails: {
          cardNumber: '1234567890123456',
          cardHolder: 'Test User',
          expirationDate: '12/23',
          cvv: '123',
        },
      };

      const transactionResponse = {
        internalTransactionId: 'txn_123',
        status: 'success',
      } as IPaymentServiceResponse;

      processPaymentUseCase.execute.mockResolvedValue(transactionResponse);

      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await paymentController.processPayment(paymentData, response as Response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(transactionResponse);
      expect(processPaymentUseCase.execute).toHaveBeenCalledWith(
        paymentData.productId,
        paymentData.quantity,
        { token: paymentData.cardToken, email: paymentData.email },
      );
    });

    it('should return 500 status code and error message when an error occurs', async () => {
      const paymentData: ProcessPaymentDto = {
        productId: 'product123',
        quantity: 2,
        cardToken: 'card_token_123',
        email: 'test@example.com',
        paymentDetails: {
          cardNumber: '1234567890123456',
          cardHolder: 'Test User',
          expirationDate: '12/23',
          cvv: '123',
        },
      };

      const errorMessage = 'Something went wrong';
      processPaymentUseCase.execute.mockRejectedValue(new Error(errorMessage));

      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await paymentController.processPayment(paymentData, response as Response);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should return all transactions', async () => {
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      transactionService.find.mockResolvedValue([
        {
          _id: 'txn_123',
          id: 'txn_123',
          status: 'APPROVED',
          product: {
            description: 'Product 1',
            price: 100,
            id: 'product123',
            name: 'Product 1',
            stockQuantity: 1,
            publicImageURL: 'http://example.com/image.jpg',
          },
          quantity: 1,
          totalAmount: 100,
        },
      ]);

      await paymentController.findAllTransactions(response as Response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith([
        {
          internalTransactionId: 'txn_123',
          status: 'success',
        },
      ]);
    });

    it('should return 404 when no transactions are found', async () => {
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      transactionService.find.mockResolvedValue([]);

      await paymentController.findAllTransactions(response as Response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ message: 'No transactions found' });
    });

    it('should return 500 status code and error message when an error occurs', async () => {
      const errorMessage = 'Something went wrong';
      transactionService.find.mockRejectedValue(new Error(errorMessage));

      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await paymentController.findAllTransactions(response as Response);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should inject processPaymentUseCase and transactionService', () => {
      const paymentController = Container.get(PaymentController);
      expect(paymentController).toBeInstanceOf(PaymentController);
    });
  });
});
