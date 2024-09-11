import { ErrorHandlerMiddleware } from '../../../infrastructure/web/middlewares/errorHandle.middleware';
import { Request, Response } from 'express';
import { BadRequestError, NotFoundError } from 'routing-controllers';

describe('ErrorHandlerMiddleware', () => {
  let errorHandlerMiddleware: ErrorHandlerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    errorHandlerMiddleware = new ErrorHandlerMiddleware();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should handle BadRequestError', () => {
    const error = new BadRequestError('Bad request');
    errorHandlerMiddleware.error(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: 'Bad request',
      }),
    );
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('Not found');
    errorHandlerMiddleware.error(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        message: 'Not found',
      }),
    );
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');
    errorHandlerMiddleware.error(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        message: 'Something went wrong',
      }),
    );
  });
});
