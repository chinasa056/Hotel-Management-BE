import { Router } from 'express';
import CheckInOutController from '../controllers/checkInOut.controller';
import  validationMiddleware from '../middleware/validationMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import { checkInSchema, checkOutSchema } from 'src/validation/checkInOutValidation';

const router = Router();

router.post(
  '/check-in/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  validationMiddleware(checkInSchema),
  CheckInOutController.checkIn.bind(CheckInOutController)
);

router.post(
  '/check-out/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  validationMiddleware(checkOutSchema),
  CheckInOutController.checkOut.bind(CheckInOutController)
);

export default router;