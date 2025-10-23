import Joi from 'joi';

export const reservationIdSchema = Joi.object({
  reservationId: Joi.string().uuid().required(),
});