import { Router } from 'express';
import AvailabilityController from '../controllers/AvailabilityController';
import authMiddleware from '../middleware/authMiddleware';
import joiValidationMiddleware from '../middleware/validationMiddleware';
import { availableRoomsSchema, availabilitySummarySchema, roomDayAvailabilitySchema, singleDateAvailabilitySchema } from '../validation/availabilityValidator';
const router = Router();

router.get(
  '/rooms',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  joiValidationMiddleware(availableRoomsSchema),
  AvailabilityController.getAvailableRooms.bind(AvailabilityController)
);

router.get(
  '/summary',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  joiValidationMiddleware(availabilitySummarySchema),
  AvailabilityController.getAvailabilitySummary.bind(AvailabilityController)
);

router.get(
  '/room-days',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  joiValidationMiddleware(roomDayAvailabilitySchema),
  AvailabilityController.getRoomDayAvailability.bind(AvailabilityController)
);

router.get(
  '/single-date',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  joiValidationMiddleware(singleDateAvailabilitySchema),
  AvailabilityController.getSingleDateAvailability.bind(AvailabilityController)
);

export default router;