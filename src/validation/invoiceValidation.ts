import Joi from 'joi';

export const getInvoiceSchema = {
  params: Joi.object({
    reservationId: Joi.string().uuid().required(),
  }),
};