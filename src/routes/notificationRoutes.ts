import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import  validationMiddleware  from '../middleware/validationMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import { reservationIdSchema } from '../validation/notificationValidation';

const router = Router();

router.post(
  '/check-in/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
//   validationMiddleware(reservationIdSchema),
  NotificationController.sendCheckInReminder.bind(NotificationController)
);

router.post(
  '/check-out/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_daesk']),
//   validationMiddleware(reservationIdSchema),
  NotificationController.sendCheckOutReminder.bind(NotificationController)
);

export default router;