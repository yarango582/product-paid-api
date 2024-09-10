import { Product } from '../../../domain/entities/product.entity';

export interface Transaction {
  id: string;
  product: Product;
  quantity: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  totalAmount: number;
}

export interface TransactionRepositoryPort {
  create(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateStatus(id: string, status: Transaction['status']): Promise<void>;
}
