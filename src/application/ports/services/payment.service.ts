export interface IPaymentServiceResponse {
  status: string;
  internalTransactionId: string;
  externalTransactionId?: string;
  amount?: number;
  currency?: string;
  reference?: string;
}
export interface PaymentServicePort {
  processPayment(transactionId: string, amount: number, paymentDetails: any): Promise<any>;
}
