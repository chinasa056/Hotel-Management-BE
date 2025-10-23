import { Router } from 'express';
import paymentRoutes from './paymentRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/api/v1/payments', paymentRoutes);
router.use('/api/v1/notifications', notificationRoutes);

export default router;