import Joi from 'joi';

export const initializePaymentSchema = {
  params: Joi.object({
    reservationId: Joi.string().uuid().required(),
  }),
};

export const verifyPaymentSchema = {
  params: Joi.object({
    reference: Joi.string().required(),
  }),
};