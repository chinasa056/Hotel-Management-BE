import { Router } from 'express';
import paymentRoutes from './paymentRoutes';
import notificationRoutes from './notificationRoutes';
import checkInOutRoutes from './checkInOut.routes';
import housekeepingRoutes from './housekeepingRoutes';

const router = Router();

router.use('/api/v1/payments', paymentRoutes);
router.use('/api/v1/notifications', notificationRoutes);
router.use('/api/v1/check-in-out', checkInOutRoutes);
router.use('api/v1/housekeeping', housekeepingRoutes)

export default router;