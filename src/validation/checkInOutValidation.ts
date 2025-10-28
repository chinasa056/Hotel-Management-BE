import Joi from 'joi';

export const checkInSchema = {
  body: Joi.object({
    reservationId: Joi.string().uuid().required().messages({
      'string.uuid': 'Reservation ID must be a valid UUID',
      'any.required': 'Reservation ID is required',
    }),
    check_in_date: Joi.date().iso().required().messages({
      'date.base': 'Check-in date must be a valid ISO8601 date',
      'any.required': 'Check-in date is required',
    }),
  }),
};

export const checkOutSchema = {
  body: Joi.object({
    reservationId: Joi.string().uuid().required().messages({
      'string.uuid': 'Reservation ID must be a valid UUID',
      'any.required': 'Reservation ID is required',
    }),
    check_out_date: Joi.date().iso().required().messages({
      'date.base': 'Check-out date must be a valid ISO8601 date',
      'any.required': 'Check-out date is required',
    }),
  }),
};