import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      req.valid ??= {};
      if (schemas.params) req.valid.params = schemas.params.parse(req.params);
      if (schemas.query) req.valid.query = schemas.query.parse(req.query);
      if (schemas.body) req.valid.body = schemas.body.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
