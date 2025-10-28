import Joi from 'joi';

const presetValues = ['today', 'last_7_days', 'last_14_days', 'month_to_date', 'last_3_months', 'last_12_months', 'year_to_date', 'custom'];

export const revenueReportSchema = {
  query: Joi.object({
    preset: Joi.string().valid(...presetValues).optional().messages({
      'any.only': 'Preset must be one of: ' + presetValues.join(', '),
    }),
    start_date: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
    }),
    end_date: Joi.date().iso().optional().messages({
      'date.base': 'End date must be a valid ISO8601 date',
    }),
    room_type: Joi.string().optional().messages({
      'string.empty': 'Room type cannot be empty',
    }),
    granularity: Joi.string().valid('daily', 'weekly', 'monthly').optional().messages({
      'any.only': 'Granularity must be one of: daily, weekly, monthly',
    }),
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
    }),
  }),
};

export const paymentStatusReportSchema = {
  query: Joi.object({
    preset: Joi.string().valid(...presetValues).optional().messages({
      'any.only': 'Preset must be one of: ' + presetValues.join(', '),
    }),
    start_date: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
    }),
    end_date: Joi.date().iso().optional().messages({
      'date.base': 'End date must be a valid ISO8601 date',
    }),
    status: Joi.string().valid('Pending', 'Success', 'Failed').optional().messages({
      'any.only': 'Status must be one of: Pending, Success, Failed',
    }),
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
    }),
  }),
};

export const bookingFinancialsSchema = {
  query: Joi.object({
    preset: Joi.string().valid(...presetValues).optional().messages({
      'any.only': 'Preset must be one of: ' + presetValues.join(', '),
    }),
    start_date: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
    }),
    end_date: Joi.date().iso().optional().messages({
      'date.base': 'End date must be a valid ISO8601 date',
    }),
    reservationId: Joi.string().uuid().optional().messages({
      'string.uuid': 'Reservation ID must be a valid UUID',
    }),
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
    }),
  }),
};

export const refundReportSchema = {
  query: Joi.object({
    preset: Joi.string().valid(...presetValues).optional().messages({
      'any.only': 'Preset must be one of: ' + presetValues.join(', '),
    }),
    start_date: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
    }),
    end_date: Joi.date().iso().optional().messages({
      'date.base': 'End date must be a valid ISO8601 date',
    }),
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
    }),
  }),
};