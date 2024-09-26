import { Inject, Service } from 'typedi';
import { ProductService } from '../../infrastructure/services/product.service';
import { TransactionService } from '../../infrastructure/services/transaction.service';
import { ProviderPaymentService } from '../../infrastructure/services/paymentProvider.service';
import { IPaymentServiceResponse } from '../ports/services/payment.service';
import { TAXES } from '../../constants/taxes.constant';

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

    const totalAmountWithOutTaxes = product.price * quantity;
    const tax = totalAmountWithOutTaxes * TAXES.COL;

    const totalAmount = totalAmountWithOutTaxes + tax;

    const transaction = await this.transactionService.createTransaction({
      product,
      quantity,
      status: 'PENDING',
      totalAmount,
    });

    try {
      const paymentResult = await this.paymentService.processPayment(
        transaction._id.toString(),
        totalAmount,
        paymentDetails,
      );

      if (paymentResult.status === 'APPROVED') {
        await this.productService.updateProductStock(productId, quantity);
        await this.transactionService.updateTransactionStatus(
          transaction._id.toString(),
          'APPROVED',
        );
      } else {
        await this.transactionService.updateTransactionStatus(transaction._id.toString(), 'FAILED');
      }

      return paymentResult;
    } catch (error) {
      await this.transactionService.updateTransactionStatus(transaction._id.toString(), 'FAILED');
      return {
        status: 'FAILED',
        internalTransactionId: transaction._id.toString(),
      };
    }
  }
}
