import { Service } from 'typedi';
import axios from 'axios';
import {
  IPaymentServiceResponse,
  PaymentServicePort,
} from '../../application/ports/services/payment.service';
import logger from '../../config/logger';
import crypto from 'crypto';

@Service()
export class ProviderPaymentService implements PaymentServicePort {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly privateApiKey: string;
  private readonly signature: string;
  private externalTransactionId: string;

  constructor() {
    this.apiKey = process.env.PROVIDER_API_KEY || '';
    this.privateApiKey = process.env.PROVIDER_PRIVATE_API_KEY || '';
    this.apiUrl = process.env.PROVIDER_API_URL || '';
    this.signature = process.env.PROVIDER_SIGNATURE || '';
  }

  private async getAcceptanceToken(): Promise<string> {
    const response = await axios.get(`${this.apiUrl}/merchants/${this.apiKey}`);
    return response.data.data.presigned_acceptance.acceptance_token;
  }

  private getSignature(
    transactionId: string,
    amount: number,
    currency: string,
    dateOfExpiration?: string,
  ): string {
    let stringSignature = `${transactionId}${amount}${currency}`;
    if (dateOfExpiration) {
      stringSignature += dateOfExpiration;
    }
    stringSignature += this.signature;
    const signature = crypto.createHash('sha256').update(stringSignature).digest('hex');
    return signature;
  }

  private getReference(email: string, date: number): string {
    const stringReference = `${email}${date}`;
    const reference = crypto.createHash('sha256').update(stringReference).digest('hex');
    return reference;
  }

  async processPayment(
    transactionId: string,
    amount: number,
    paymentDetails: any,
  ): Promise<IPaymentServiceResponse> {
    try {
      const acceptanceToken = await this.getAcceptanceToken();
      const currency = 'COP';

      if (!acceptanceToken) {
        throw new Error('Error getting acceptance token');
      }

      const reference = this.getReference(paymentDetails.email, Date.now());
      const signature = this.getSignature(reference, amount * 100, currency);

      const response = await axios.post(
        `${this.apiUrl}/transactions`,
        {
          amount_in_cents: amount * 100,
          currency,
          signature,
          customer_email: paymentDetails.email,
          payment_method: {
            type: 'CARD',
            installments: 1,
            token: paymentDetails.token,
          },
          reference,
          acceptance_token: acceptanceToken,
          payment_method_type: 'CARD',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const externalTransactionId = response.data.data.id;

      if (response.data.data.status === 'PENDING') {
        const id = response.data.data.id;
        this.externalTransactionId = id;
        const result = await this.validatePayment(id);
        if (!result) {
          return {
            status: 'PENDING',
            externalTransactionId,
            internalTransactionId: transactionId,
            amount: amount,
            currency: currency,
            reference: reference,
          };
        }
        logger.info(`Payment for transaction ${transactionId} processed successfully`);
        return {
          status: 'APPROVED',
          externalTransactionId,
          internalTransactionId: transactionId,
          amount: amount,
          currency: currency,
          reference: reference,
        };
      } else {
        return {
          status: 'APPROVED',
          internalTransactionId: transactionId,
          externalTransactionId,
          amount: amount,
          currency: currency,
          reference: reference,
        };
      }
    } catch (error: any) {
      logger.error(`Error processing payment for transaction ${transactionId}`, error);
      return {
        status: 'FAILED',
        internalTransactionId: transactionId,
        externalTransactionId: undefined,
      };
    }
  }

  async validatePayment(transactionId: string): Promise<boolean> {
    const attempts = 5;
    const milliseconds = 5000;
    let currentAttempt = 1;
    while (currentAttempt <= attempts) {
      try {
        const response = await axios.get(`${this.apiUrl}/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.data.status === 'APPROVED') {
          return true;
        }
      } catch (error: any) {
        logger.error(`Error validating payment for transaction ${transactionId}`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, milliseconds));
      currentAttempt++;
    }
    return false;
  }
}
