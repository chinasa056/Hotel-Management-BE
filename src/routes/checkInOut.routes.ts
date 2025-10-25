import { Router } from 'express';
import CheckInOutController from '../controllers/checkInOut.controller';
// import  validationMiddleware from '../middleware/validationMiddleware';
// import {reservationIdSchema} from '../validation/checkInOutValidation';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.post(
  '/check-in/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  CheckInOutController.checkIn.bind(CheckInOutController)
);

router.post(
  '/check-out/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  CheckInOutController.checkOut.bind(CheckInOutController)
);

export default router;