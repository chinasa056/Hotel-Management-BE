// src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import RequestValidationError from '../error/RequestValidationError'; 

// Define the shape for validation schema
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
                errors.body = error.details.map(d => ({ field: d.context?.key, message: d.message }));
            }
        }
        
        // Validate req.query
        if (schema.query) {
            const { error } = schema.query.validate(req.query, { abortEarly: false });
            if (error) {
                errors.query = error.details.map(d => ({ field: d.context?.key, message: d.message }));
            }
        }
        
        // Validate req.params
        if (schema.params) {
            const { error } = schema.params.validate(req.params); // abortEarly is fine for params
            if (error) {
                errors.params = error.details.map(d => ({ field: d.context?.key, message: d.message }));
            }
        }

        // If any error exists, throw a custom validation error
        if (Object.keys(errors).length > 0) {
            // Include the specific errors in the data payload
            return next(new RequestValidationError('Invalid data provided for the request.', errors));
        }
        
        next();
    };
};

export default validationMiddleware;