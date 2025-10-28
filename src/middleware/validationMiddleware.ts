import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import RequestValidationError from '../error/RequestValidationError';
import { logger } from '../utils/logger';

export interface Schema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const validationMiddleware = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any = {};

    // Validate req.body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.body = error.details.map(d => ({
          field: d.context?.key || d.path.join('.'),
          message: d.message.replace(/"/g, "'"),
        }));
      }
    }

    // Validate req.query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.query = error.details.map(d => ({
          field: d.context?.key || d.path.join('.'),
          message: d.message.replace(/"/g, "'"),
        }));
      }
    }

    // Validate req.params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.params = error.details.map(d => ({
          field: d.context?.key || d.path.join('.'),
          message: d.message.replace(/"/g, "'"),
        }));
      }
    }

    // Log and throw validation errors
    if (Object.keys(errors).length > 0) {
      logger.error('Validation failed', { errors, request: { body: req.body, query: req.query, params: req.params } });
      return next(new RequestValidationError('Invalid data provided for the request', errors));
    }

    next();
  };
};

export default validationMiddleware;