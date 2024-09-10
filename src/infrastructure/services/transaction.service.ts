import { Service } from 'typedi';
import { TransactionRepositoryPort } from '../../application/ports/repositories/transaction.repository';

@Service()
export class TransactionService {
  constructor(private transactionRepository: TransactionRepositoryPort) {}

  async createTransaction(transactionData: any) {
    return this.transactionRepository.create(transactionData);
  }

  async updateTransactionStatus(id: string, status: 'PENDING' | 'APPROVED' | 'FAILED') {
    return this.transactionRepository.updateStatus(id, status);
  }
}
