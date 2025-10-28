import Joi from 'joi';

export const generateInvoiceSchema = {
  body: Joi.object({
    reservationId: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid reservation ID',
      'any.required': 'reservationId is required',
    }),
  }),
};

export const generateReportSchema = {
  body: Joi.object({
    type: Joi.string()
      .valid('revenue_report', 'payment_status_report', 'availability_report')
      .required(),
    filters: Joi.object().optional(),
  }),
};