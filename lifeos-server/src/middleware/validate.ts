import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';

export interface IRequestSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validateRequest = (schemas: IRequestSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        Object.defineProperty(req, 'params', {
          value: parsedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(error);
        return;
      }
      next(error);
    }
  };
};
