import { Inject, Service } from 'typedi';
import { ProductService } from '../../infrastructure/services/product.service';
import { TransactionService } from '../../infrastructure/services/transaction.service';
import { ProviderPaymentService } from '../../infrastructure/services/paymentProvider.service';
import { IPaymentServiceResponse } from '../ports/services/payment.service';

@Service()
export class ProcessPaymentUseCase {
  private transactionResult: IPaymentServiceResponse;
  constructor(
    @Inject(() => ProductService) private productService: ProductService,
    @Inject(() => TransactionService) private transactionService: TransactionService,
    @Inject(() => ProviderPaymentService) private paymentService: ProviderPaymentService,
  ) {}

  async execute(
    productId: string,
    quantity: number,
    paymentDetails: any,
  ): Promise<IPaymentServiceResponse> {
    const product = await this.productService.getProductById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stockQuantity < quantity) throw new Error('Insufficient stock');

    const totalAmount = product.price * quantity;
    const transaction = await this.transactionService.createTransaction({
      product,
      quantity,
      status: 'PENDING',
      totalAmount,
    });

    try {
      const isTransaction = await this.paymentService.processPayment(
        transaction._id.toString(),
        totalAmount,
        paymentDetails,
      );
      this.transactionResult = isTransaction;
      if (isTransaction.status === 'APPROVED') {
        await this.productService.updateProductStock(productId, quantity);
        await this.transactionService.updateTransactionStatus(
          transaction._id.toString(),
          'APPROVED',
        );
        return {
          status: 'APPROVED',
          internalTransactionId: isTransaction.internalTransactionId,
          externalTransactionId: isTransaction.externalTransactionId,
          amount: isTransaction.amount,
          currency: isTransaction.currency,
          reference: isTransaction.reference,
        };
      }
      return {
        status: isTransaction.status,
        internalTransactionId: isTransaction.internalTransactionId,
        externalTransactionId: isTransaction.externalTransactionId,
        amount: isTransaction.amount,
        currency: isTransaction.currency,
        reference: isTransaction.reference,
      };
    } catch (error) {
      await this.transactionService.updateTransactionStatus(transaction._id.toString(), 'FAILED');
      return {
        status: this.transactionResult.status,
        internalTransactionId: this.transactionResult.internalTransactionId,
        externalTransactionId: this.transactionResult.externalTransactionId,
        amount: this.transactionResult.amount,
        currency: this.transactionResult.currency,
        reference: this.transactionResult.reference,
      };
    }
  }
}
