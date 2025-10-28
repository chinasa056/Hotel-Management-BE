import Joi from 'joi';

export const initializePaymentSchema = {
  params: Joi.object({
    reservationId: Joi.string().uuid().required().messages({
      'string.uuid': 'Reservation ID must be a valid UUID',
      'any.required': 'Reservation ID is required',
    }),
  }),
  body: Joi.object({
    userId: Joi.string().uuid().required().messages({
      'string.uuid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
  }),
};

export const verifyPaymentSchema = {
  query: Joi.object({
    reference: Joi.string().required().messages({
      'any.required': 'Reference is required',
      'string.empty': 'Reference cannot be empty',
    }),
  }),
};