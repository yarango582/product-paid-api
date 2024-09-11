import { JsonController, Post, Body, Res, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProcessPaymentDto } from '../../../application/dtos/processPayment.dto';
import { Response } from 'express';
import { TransactionService } from '../../services/transaction.service';

@JsonController('/payments')
@Service()
export class PaymentController {
  constructor(
    @Inject(() => ProcessPaymentUseCase) private processPaymentUseCase: ProcessPaymentUseCase,
    @Inject(() => TransactionService) private transactionService: TransactionService,
  ) {}

  @Post('/process')
  async processPayment(
    @Body() paymentData: ProcessPaymentDto,
    @Res() response: Response,
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      const transaction = await this.processPaymentUseCase.execute(
        paymentData.productId,
        paymentData.quantity,
        { token: paymentData.cardToken, email: paymentData.email },
      );
      return response.status(200).json(transaction);
    } catch (error: any) {
      response.status(500).json({ message: error?.message || 'Internal server error' });
    }
  }

  @Get('/')
  async findAllTransactions(
    @Res() response: Response,
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      const transactions = await this.transactionService.find({});
      if (!transactions) {
        return response.status(404).json({ message: 'No transactions found' });
      }
      return response.status(200).json(transactions);
    } catch (error: any) {
      response.status(500).json({ message: error?.message || 'Internal server error' });
    }
  }
}
