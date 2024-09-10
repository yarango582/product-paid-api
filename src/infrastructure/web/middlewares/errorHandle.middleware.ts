import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import logger from '../../../config/logger';
import { Service } from 'typedi';

@Middleware({ type: 'after' })
@Service()
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, _next: NextFunction) {
    logger.error(`Error: ${error.message}`, { stack: error.stack });

    const status = error.httpCode || 500;
    const message = error.message || 'Something went wrong';

    response.status(status).json({
      status,
      message,
    });
  }
}
