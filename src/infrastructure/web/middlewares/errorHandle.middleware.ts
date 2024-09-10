import {
  Middleware,
  ExpressErrorMiddlewareInterface,
  BadRequestError,
  NotFoundError,
} from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import logger from '../../../config/logger';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, _next: NextFunction) {
    logger.error(`Error: ${error.message}`, { stack: error.stack });

    let status = 500;
    let message = 'Something went wrong';

    if (error instanceof BadRequestError) {
      status = 400;
      message = error.message;
    } else if (error instanceof NotFoundError) {
      status = 404;
      message = error.message;
    } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
      status = 400;
      message = 'Invalid ID format';
    }

    response.status(status).json({
      status,
      message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
