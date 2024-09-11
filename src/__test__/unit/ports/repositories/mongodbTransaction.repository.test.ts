import mongoose from 'mongoose';
import { Product } from '../../../../domain/entities/product.entity';
import { MongoDBTransactionRepository } from '../../../../infrastructure/repositories/mongodbTransaction.repository';

jest.mock('mongoose', () => {
  const mockedMongoose = jest.requireActual('mongoose');

  const mockTransactionModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn().mockReturnValue({
      populate: jest.fn(),
    }),
  };

  return {
    ...mockedMongoose,
    model: jest.fn(() => mockTransactionModel),
    Schema: mockedMongoose.Schema,
  };
});

describe('MongoDBTransactionRepository', () => {
  let repository: MongoDBTransactionRepository;
  let mockTransactionModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransactionModel = (mongoose.model as jest.Mock)('Transaction');
    repository = new MongoDBTransactionRepository();
  });

  it('should create a transaction', async () => {
    const validObjectId = new mongoose.Types.ObjectId();
    const transactionData = {
      product: { id: validObjectId.toString() },
      quantity: 2,
      status: 'PENDING',
      totalAmount: 200,
    };

    const mockCreatedTransaction = {
      _id: validObjectId,
      ...transactionData,
      product: validObjectId.toString(),
    };

    mockTransactionModel.create.mockResolvedValue(mockCreatedTransaction);

    const result = await repository.create(transactionData as any);

    expect(mockTransactionModel.create).toHaveBeenCalledWith({
      ...transactionData,
      product: validObjectId.toString(),
    });

    expect(result).toEqual({
      _id: validObjectId.toString(),
      id: validObjectId.toString(),
      product: validObjectId.toString(),
      quantity: 2,
      status: 'PENDING',
      totalAmount: 200,
    });
  });

  it('should update transaction status', async () => {
    await repository.updateStatus('trans1', 'APPROVED');

    expect(mockTransactionModel.findByIdAndUpdate).toHaveBeenCalledWith('trans1', {
      status: 'APPROVED',
    });
  });

  it('should find transactions', async () => {
    const mockTransactions = [
      { _id: 'trans1', product: '1', quantity: 2, status: 'APPROVED', totalAmount: 200 },
      { _id: 'trans2', product: '2', quantity: 1, status: 'PENDING', totalAmount: 100 },
    ];
    mockTransactionModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockTransactions),
    });

    const result = await repository.find({ product: { id: '1', name: 'Product 1' } as Product });

    expect(mockTransactionModel.find).toHaveBeenCalledWith({
      product: {
        id: '1',
        name: 'Product 1',
      },
    });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('trans1');
    expect(result[1].id).toBe('trans2');
  });
});
