import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import logger from '../../../config/logger';

@Middleware({ type: 'before' })
@Service()
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction) {
    logger.info(`${request.method} ${request.path}`, {
      body: request.body,
      query: request.query,
      ip: request.ip,
    });
    next();
  }
}
