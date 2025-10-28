import Joi from 'joi';

export const availableRoomsSchema = {
  query: Joi.object({
    start_date: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
      'any.required': 'Start date is required',
    }),
    end_date: Joi.date().iso().required().messages({
      'date.base': 'End date must be a valid ISO8601 date',
      'any.required': 'End date is required',
    }),
    room_type: Joi.string().optional().messages({
      'string.empty': 'Room type cannot be empty',
    }),
    room_id: Joi.string().uuid().optional().messages({
      'string.uuid': 'Room ID must be a valid UUID',
    }),
    status: Joi.string().valid('Vacant', 'Occupied', 'Needs Cleaning').optional().messages({
      'any.only': 'Status must be one of: Vacant, Occupied, Needs Cleaning',
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

export const availabilitySummarySchema = {
  query: Joi.object({
    start_date: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
      'any.required': 'Start date is required',
    }),
    end_date: Joi.date().iso().required().messages({
      'date.base': 'End date must be a valid ISO8601 date',
      'any.required': 'End date is required',
    }),
  }),
};

export const roomDayAvailabilitySchema = {
  query: Joi.object({
    room_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Room ID must be a valid UUID',
      'any.required': 'Room ID is required',
    }),
    start_date: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid ISO8601 date',
      'any.required': 'Start date is required',
    }),
    end_date: Joi.date().iso().required().messages({
      'date.base': 'End date must be a valid ISO8601 date',
      'any.required': 'End date is required',
    }),
  }),
};

export const singleDateAvailabilitySchema = {
  query: Joi.object({
    date: Joi.date().iso().required().messages({
      'date.base': 'Date must be a valid ISO8601 date',
      'any.required': 'Date is required',
    }),
    room_id: Joi.string().uuid().optional().messages({
      'string.uuid': 'Room ID must be a valid UUID',
    }),
  }),
};