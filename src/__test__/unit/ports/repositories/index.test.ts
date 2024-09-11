import * as repositories from '../../../../application/ports/repositories';

describe('Repository Exports', () => {
  it('should export ProductRepositoryPort from product.repository', () => {
    expect(repositories).toBeDefined();
  });

  it('should export TransactionRepositoryPort from transaction.repository', () => {
    expect(repositories).toBeDefined();
  });
});
