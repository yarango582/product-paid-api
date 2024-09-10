import { JsonController, Post, Body, Res } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProcessPaymentDto } from '../../../application/dtos/processPayment.dto';
import { IPaymentServiceResponse } from '~/application/ports/services/payment.service';
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
  ): Promise<IPaymentServiceResponse | any> {
    try {
      const transaction = await this.processPaymentUseCase.execute(
        paymentData.productId,
        paymentData.quantity,
        { token: paymentData.cardToken, email: paymentData.email },
      );
      return transaction;
    } catch (error: any) {
      response.status(500).send({ message: error?.message || 'Internal server error' });
    }
  }
}
