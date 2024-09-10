import { Service } from 'typedi';
import { ProductRepositoryPort } from '../ports/repositories/product.repository';
import { PaymentServicePort } from '../ports/services/payment.service';
import { TransactionRepositoryPort } from '../ports/repositories/transaction.repository';

@Service()
export class ProcessPaymentUseCase {
  constructor(
    private productRepository: ProductRepositoryPort,
    private paymentService: PaymentServicePort,
    private transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(productId: string, quantity: number, paymentDetails: any): Promise<string> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stockQuantity < quantity) throw new Error('Insufficient stock');

    const totalAmount = product.price * quantity;
    const transaction = await this.transactionRepository.create({
      product,
      quantity,
      status: 'PENDING',
      totalAmount,
    });

    try {
      await this.paymentService.processPayment(transaction.id, totalAmount, paymentDetails);
      await this.productRepository.updateStock(productId, product.stockQuantity - quantity);
      await this.transactionRepository.updateStatus(transaction.id, 'COMPLETED');
      return transaction.id;
    } catch (error) {
      await this.transactionRepository.updateStatus(transaction.id, 'FAILED');
      throw error;
    }
  }
}
