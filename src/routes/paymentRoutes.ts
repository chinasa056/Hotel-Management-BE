import express from 'express';
import PaymentController from '../controllers/PaymentController';
import authMiddleware from '../middleware/authMiddleware';
import validationMiddleware from '../middleware/validationMiddleware';
import { initializePaymentSchema, verifyPaymentSchema } from '../validation/paymentValidation';

const router = express.Router();

router.post(
  '/payments/initialize/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk', 'customer']),
  validationMiddleware(initializePaymentSchema),
  PaymentController.initializePayment.bind(PaymentController)
);

router.get(
  '/payments/verify/:reference',
  authMiddleware(['super_admin', 'manager', 'front_desk', 'customer']),
  validationMiddleware(verifyPaymentSchema),
  PaymentController.verifyPayment.bind(PaymentController)
);

export default router;