export interface PaymentServicePort {
  processPayment(transactionId: string, amount: number, paymentDetails: any): Promise<void>;
}
