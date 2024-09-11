import mongoose from 'mongoose';
import { connectToMongoDB } from '../../../infrastructure/database/mongodbConnection';
import logger from '../../../config/logger';

jest.mock('mongoose');
jest.mock('../../../config/logger');

describe('MongoDB Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect successfully to MongoDB', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);

    await connectToMongoDB();

    expect(mongoose.connect).toHaveBeenCalledWith(expect.any(String));
    expect(logger.info).toHaveBeenCalledWith('Connected to MongoDB');
  });

  it('should handle connection errors', async () => {
    const mockError = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValue(mockError);

    await expect(connectToMongoDB()).rejects.toThrow('Connection failed');
    expect(logger.error).toHaveBeenCalledWith('Failed to connect to MongoDB', { error: mockError });
  });
});
