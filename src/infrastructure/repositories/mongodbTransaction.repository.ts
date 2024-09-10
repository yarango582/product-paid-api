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

@Service()
export class MongoDBTransactionRepository implements TransactionRepositoryPort {
  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction = new TransactionModel({
      ...transaction,
      product: transaction.product.id,
    });
    await newTransaction.save();
    return newTransaction.toObject();
  }

  async updateStatus(id: string, status: Transaction['status']): Promise<void> {
    await TransactionModel.findByIdAndUpdate(id, { status });
  }
}
