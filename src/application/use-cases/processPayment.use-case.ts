import { Inject, Service } from 'typedi';
import { ProductService } from '../../infrastructure/services/product.service';
import { TransactionService } from '../../infrastructure/services/transaction.service';
import { ProviderPaymentService } from '../../infrastructure/services/paymentProvider.service';

@Service()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(() => ProductService) private productService: ProductService,
    @Inject(() => TransactionService) private transactionService: TransactionService,
    @Inject(() => ProviderPaymentService) private paymentService: ProviderPaymentService,
  ) {}

  async execute(productId: string, quantity: number, paymentDetails: any): Promise<string> {
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
      await this.paymentService.processPayment(transaction.id, totalAmount, paymentDetails);
      await this.productService.updateProductStock(productId, product.stockQuantity - quantity);
      await this.transactionService.updateTransactionStatus(transaction.id, 'COMPLETED');
      return transaction.id;
    } catch (error) {
      await this.transactionService.updateTransactionStatus(transaction.id, 'FAILED');
      throw error;
    }
  }
}
