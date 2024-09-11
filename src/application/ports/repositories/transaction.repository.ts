import { Product } from '../../../domain/entities/product.entity';

export interface Transaction {
  _id: string;
  id: string;
  product: Product;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'FAILED';
  totalAmount: number;
}

export interface TransactionRepositoryPort {
  create(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateStatus(id: string, status: Transaction['status']): Promise<void>;
  find(filter: Partial<Transaction>): Promise<Transaction[]>;
}
