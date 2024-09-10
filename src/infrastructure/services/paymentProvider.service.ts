import { Service } from 'typedi';
import axios from 'axios';
import { PaymentServicePort } from '../../application/ports/services/payment.service';
import logger from '../../config/logger';

@Service()
export class ProviderPaymentService implements PaymentServicePort {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.PROVIDER_API_KEY || '';
    this.apiUrl = process.env.PROVIDER_API_URL || '';
  }

  async processPayment(transactionId: string, amount: number, paymentDetails: any): Promise<void> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transactions`,
        {
          amount_in_cents: amount * 100,
          currency: 'COP',
          customer_email: paymentDetails.email,
          payment_method: {
            type: 'CARD',
            token: paymentDetails.token,
            installments: 1,
          },
          reference: transactionId,
          payment_source_id: null,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.data.status === 'APPROVED') {
        logger.info(`Payment for transaction ${transactionId} processed successfully`);
      } else {
        throw new Error(
          `Payment for transaction ${transactionId} failed: ${response.data.data.status_message}`,
        );
      }
    } catch (error: any) {
      logger.error(`Error processing payment for transaction ${transactionId}`, error);
      throw new Error(`Payment processing failed: ${error?.message || 'Unknown error'}`);
    }
  }
}
