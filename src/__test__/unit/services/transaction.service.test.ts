import { TransactionService } from '../../../infrastructure/services/transaction.service';
import { TransactionRepositoryPort } from '../../../application/ports/repositories/transaction.repository';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let transactionRepositoryMock: jest.Mocked<TransactionRepositoryPort>;

  beforeEach(() => {
    transactionRepositoryMock = {
      create: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    transactionService = new TransactionService(transactionRepositoryMock);
  });

  it('debería crear una transacción', async () => {
    const mockTransactionData = {
      product: { id: '1' },
      quantity: 1,
      status: 'PENDING',
      totalAmount: 100,
    };
    transactionRepositoryMock.create.mockResolvedValue({
      ...mockTransactionData,
      _id: '123',
    } as any);

    const result = await transactionService.createTransaction(mockTransactionData);
    expect(result).toEqual({ ...mockTransactionData, _id: '123' });
    expect(transactionRepositoryMock.create).toHaveBeenCalledWith(mockTransactionData);
  });

  it('debería actualizar el estado de una transacción', async () => {
    await transactionService.updateTransactionStatus('123', 'APPROVED');
    expect(transactionRepositoryMock.updateStatus).toHaveBeenCalledWith('123', 'APPROVED');
  });
});
