import Joi from 'joi';

export const reservationIdSchema = Joi.object({
  param: Joi.object({
    reservationId: Joi.string().uuid().required(),
  }),
});

