import express from 'express';
import InvoiceController from '../controllers/InvoiceController';
import authMiddleware from '../middleware/authMiddleware';
import validationMiddleware from '../middleware/validationMiddleware';
import { getInvoiceSchema } from '../validation/invoiceValidation';

const router = express.Router();

router.get(
  '/invoices/:reservationId',
  authMiddleware(['super_admin', 'manager', 'front_desk', 'customer', 'accountant']),
  validationMiddleware(getInvoiceSchema),
  InvoiceController.getInvoice.bind(InvoiceController)
);

export default router;