import { Service } from 'typedi';
import { Model, model, Schema } from 'mongoose';
import { Transaction, TransactionRepositoryPort } from '../../application/ports/repositories';

const TransactionSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  status: String,
  totalAmount: Number,
});

const TransactionModel: Model<Transaction> = model<Transaction>('Transaction', TransactionSchema);

@Service('TransactionRepositoryPort')
export class MongoDBTransactionRepository implements TransactionRepositoryPort {
  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction = await TransactionModel.create({
      ...transaction,
      product: transaction.product.id,
    });
    return this.mapToTransaction(newTransaction);
  }

  async updateStatus(id: string, status: Transaction['status']): Promise<void> {
    await TransactionModel.findByIdAndUpdate(id, { status });
  }

  async find(filter: Partial<Transaction>): Promise<Transaction[]> {
    const transactions = await TransactionModel.find(filter).populate('product');
    return transactions.map(this.mapToTransaction);
  }

  private mapToTransaction(doc: any): Transaction {
    return {
      _id: doc._id?.toString() || doc.id,
      id: doc._id?.toString() || doc.id,
      product: doc.product,
      quantity: doc.quantity,
      status: doc.status,
      totalAmount: doc.totalAmount,
    };
  }
}
