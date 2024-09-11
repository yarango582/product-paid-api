import { JsonController, Post, Body, Res } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProcessPaymentDto } from '../../../application/dtos/processPayment.dto';
import { Response } from 'express';

@JsonController('/payments')
@Service()
export class PaymentController {
  constructor(
    @Inject(() => ProcessPaymentUseCase) private processPaymentUseCase: ProcessPaymentUseCase,
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
}
