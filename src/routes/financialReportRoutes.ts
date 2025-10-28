import { Router } from 'express';
import FinancialReportController from '../controllers/FinancialReportController';
import authMiddleware from '../middleware/authMiddleware';
import joiValidationMiddleware from '../middleware/validationMiddleware';
import { revenueReportSchema, paymentStatusReportSchema, bookingFinancialsSchema, refundReportSchema } from '../validation/reportValidator';

const router = Router();

router.get(
  '/revenue',
  authMiddleware(['super_admin', 'manager', 'accountant']),
  joiValidationMiddleware(revenueReportSchema),
  FinancialReportController.getRevenueReport.bind(FinancialReportController)
);

router.get(
  '/payment-status',
  authMiddleware(['super_admin', 'manager', 'accountant']),
  joiValidationMiddleware(paymentStatusReportSchema),
  FinancialReportController.getPaymentStatusReport.bind(FinancialReportController)
);

router.get(
  '/booking-financials',
  authMiddleware(['super_admin', 'manager', 'accountant']),
  joiValidationMiddleware(bookingFinancialsSchema),
  FinancialReportController.getBookingFinancials.bind(FinancialReportController)
);

router.get(
  '/refunds',
  authMiddleware(['super_admin', 'manager', 'accountant']),
  joiValidationMiddleware(refundReportSchema),
  FinancialReportController.getRefundReport.bind(FinancialReportController)
);

export default router;