import 'reflect-metadata';
import { PaymentController } from '../../../infrastructure/web/controllers/payment.controller';
import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProcessPaymentDto } from '../../../application/dtos/processPayment.dto';
import { Response } from 'express';
import { Container } from 'typedi';
import { IPaymentServiceResponse } from '../../../application/ports/services/payment.service';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let processPaymentUseCase: jest.Mocked<ProcessPaymentUseCase>;

  beforeEach(() => {
    processPaymentUseCase = {
      execute: jest.fn(),
    } as any;

    Container.set(ProcessPaymentUseCase, processPaymentUseCase);
    paymentController = new PaymentController(processPaymentUseCase);
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
  });
});
