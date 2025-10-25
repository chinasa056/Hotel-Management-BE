import { Router } from 'express';
import HousekeepingController from '../controllers/houseKeeping.controller';
import authMiddleware  from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
// import { body, query, param } from 'express-validator';

const router = Router();

router.post(
  '/tasks',
  authMiddleware(['super_admin', 'manager', 'housekeeping_manager']),
//   validate([
//     body('room_id').isString().notEmpty().withMessage('Room ID is required'),
//     body('task_type').isIn(['cleaning', 'maintenance']).withMessage('Invalid task type'),
//     body('assigned_staff_id').optional().isString().withMessage('Invalid staff ID'),
//     body('due_date').optional().isISO8601().withMessage('Invalid due date format'),
//   ]),
  HousekeepingController.createTask.bind(HousekeepingController)
);

router.get(
  '/tasks',
  authMiddleware(['super_admin', 'manager', 'housekeeping_manager', 'accountant']),
//   validate([
//     query('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
//     query('room_id').optional().isString().withMessage('Invalid room ID'),
//     query('assigned_staff_id').optional().isString().withMessage('Invalid staff ID'),
//     query('start_date').optional().isISO8601().withMessage('Invalid start date'),
//     query('end_date').optional().isISO8601().withMessage('Invalid end date'),
//     query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
//     query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
//   ]),
  HousekeepingController.listTasks.bind(HousekeepingController)
);

router.patch(
  '/tasks/:taskId',
  authMiddleware(['super_admin', 'manager', 'housekeeping_manager']),
//   validate([
//     param('taskId').isMongoId().withMessage('Invalid task ID'),
//     body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
//     body('assigned_staff_id').optional().isString().withMessage('Invalid staff ID'),
//   ]),
  HousekeepingController.updateTask.bind(HousekeepingController)
);

export default router;