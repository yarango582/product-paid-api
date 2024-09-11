import { LoggingMiddleware } from '../../../infrastructure/web/middlewares/loggin.middleware';
import { Request, Response } from 'express';
import logger from '../../../config/logger';

jest.mock('../../../config/logger');

describe('LoggingMiddleware', () => {
  let loggingMiddleware: LoggingMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    loggingMiddleware = new LoggingMiddleware();
    mockRequest = {
      method: 'GET',
      path: '/test',
      body: { key: 'value' },
      query: { param: 'test' },
      ip: '127.0.0.1',
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should log request information', () => {
    loggingMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(logger.info).toHaveBeenCalledWith('GET /test', {
      body: { key: 'value' },
      query: { param: 'test' },
      ip: '127.0.0.1',
    });
    expect(nextFunction).toHaveBeenCalled();
  });
});
