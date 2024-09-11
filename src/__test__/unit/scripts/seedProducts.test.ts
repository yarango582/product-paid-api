import mongoose from 'mongoose';
import { seedProducts } from '../../../scripts/seedProducts';
import { MongoDBProductRepository } from '../../../infrastructure/repositories/mongodbProduct.repository';
import logger from '../../../config/logger';

jest.mock('mongoose');
jest.mock('../../../infrastructure/repositories/mongodbProduct.repository.ts');
jest.mock('../../../config/logger.ts');

describe('seedProducts', () => {
  let connectMock: jest.Mock;
  let closeMock: jest.Mock;
  let findByNameMock: jest.Mock;
  let createMock: jest.Mock;

  beforeAll(() => {
    connectMock = mongoose.connect as jest.Mock;
    closeMock = mongoose.connection.close as jest.Mock;
    findByNameMock = MongoDBProductRepository.prototype.findByName as jest.Mock;
    createMock = MongoDBProductRepository.prototype.create as jest.Mock;
    jest.spyOn(logger, 'info').mockImplementation(jest.fn());
    jest.spyOn(logger, 'error').mockImplementation(jest.fn());
  });

  beforeEach(() => {
    connectMock.mockClear();
    closeMock.mockClear();
    findByNameMock.mockClear();
    createMock.mockClear();
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  it('should connect to MongoDB', async () => {
    await seedProducts();
    expect(connectMock).toHaveBeenCalledWith(process.env.MONGODB_URI || '');
    expect(logger.info).toHaveBeenCalledWith('Connected to MongoDB');
  });

  it('should create products if they do not exist', async () => {
    findByNameMock.mockResolvedValue(null);

    await seedProducts();

    expect(createMock).toHaveBeenCalledTimes(5);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Created product:'));
  });

  it('should not create products if they already exist', async () => {
    findByNameMock.mockResolvedValue({});

    await seedProducts();

    expect(createMock).not.toHaveBeenCalled();
  });

  it('should log an error if seeding fails', async () => {
    const error = new Error('Test error');
    connectMock.mockRejectedValue(error);

    await seedProducts();

    expect(logger.error).toHaveBeenCalledWith('Error seeding products:', error);
  });

  it('should close the MongoDB connection', async () => {
    await seedProducts();
    expect(closeMock).toHaveBeenCalled();
  });
});
