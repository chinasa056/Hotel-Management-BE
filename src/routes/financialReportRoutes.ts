import { Router } from 'express';
import FinancialReportController from '../controllers/FinancialReportController';
import authMiddleware from '../middleware/authMiddleware';
// import { validate } from '../middleware/validationMiddleware';

const router = Router();

router.get(
  '/revenue',
  authMiddleware(['super_admin', 'manager', 'accountant']),
//   validate([
//     query('preset').optional().isIn(['today', 'last_7_days', 'last_14_days', 'month_to_date', 'last_3_months', 'last_12_months', 'year_to_date', 'custom']).withMessage('Invalid preset'),
//     query('start_date').optional().isISO8601().withMessage('Invalid start date'),
//     query('end_date').optional().isISO8601().withMessage('Invalid end date'),
//     query('room_type').optional().isString().withMessage('Invalid room type'),
//     query('granularity').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid granularity'),
//     query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
//     query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
//   ]),
  FinancialReportController.getRevenueReport.bind(FinancialReportController)
);

router.get(
  '/payment-status',
  authMiddleware(['super_admin', 'manager', 'accountant']),
//   validate([
//     query('preset').optional().isIn(['today', 'last_7_days', 'last_14_days', 'month_to_date', 'last_3_months', 'last_12_months', 'year_to_date', 'custom']).withMessage('Invalid preset'),
//     query('start_date').optional().isISO8601().withMessage('Invalid start date'),
//     query('end_date').optional().isISO8601().withMessage('Invalid end date'),
//     query('status').optional().isIn(['Pending', 'Success', 'Failed']).withMessage('Invalid status'),
//     query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
//     query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
//   ]),
  FinancialReportController.getPaymentStatusReport.bind(FinancialReportController)
);

router.get(
  '/booking-financials',
  authMiddleware(['super_admin', 'manager', 'accountant']),
//   validate([
//     query('preset').optional().isIn(['today', 'last_7_days', 'last_14_days', 'month_to_date', 'last_3_months', 'last_12_months', 'year_to_date', 'custom']).withMessage('Invalid preset'),
//     query('start_date').optional().isISO8601().withMessage('Invalid start date'),
//     query('end_date').optional().isISO8601().withMessage('Invalid end date'),
//     query('reservationId').optional().isString().withMessage('Invalid reservation ID'),
//     query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
//     query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
//   ]),
  FinancialReportController.getBookingFinancials.bind(FinancialReportController)
);

router.get(
  '/refunds',
  authMiddleware(['super_admin', 'manager', 'accountant']),
//   validate([
//     query('preset').optional().isIn(['today', 'last_7_days', 'last_14_days', 'month_to_date', 'last_3_months', 'last_12_months', 'year_to_date', 'custom']).withMessage('Invalid preset'),
//     query('start_date').optional().isISO8601().withMessage('Invalid start date'),
//     query('end_date').optional().isISO8601().withMessage('Invalid end date'),
//     query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
//     query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
//   ]),
  FinancialReportController.getRefundReport.bind(FinancialReportController)
);

export default router;