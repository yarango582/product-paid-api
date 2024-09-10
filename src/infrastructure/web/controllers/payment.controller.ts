import { JsonController, Post, Body } from 'routing-controllers';
import { Inject } from 'typedi';
import { ProcessPaymentUseCase } from '../../../application/use-cases/processPayment.use-case';
import { ProcessPaymentDto } from '../../../application/dtos/processPayment.dto';

@JsonController('/payments')
export class PaymentController {
  constructor(
    @Inject(() => ProcessPaymentUseCase) private processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  @Post('/process')
  async processPayment(@Body() paymentData: ProcessPaymentDto): Promise<{ transactionId: string }> {
    const transactionId = await this.processPaymentUseCase.execute(
      paymentData.productId,
      paymentData.quantity,
      { token: paymentData.cardToken, email: paymentData.email },
    );
    return { transactionId };
  }
}
