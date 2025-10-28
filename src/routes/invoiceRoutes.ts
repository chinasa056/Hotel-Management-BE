// src/routes/invoiceRoutes.ts
import express from 'express';
import InvoiceController from '../controllers/InvoiceController';
import authMiddleware from '../middleware/authMiddleware';
import joiValidationMiddleware from '../middleware/validationMiddleware';
import { generateInvoiceSchema } from '../validation/invoiceValidation';

const router = express.Router();

router.get(
  '/:invoiceId',
  authMiddleware(['super_admin', 'manager', 'accountant', 'front_desk', 'customer']),
  InvoiceController.getPDF.bind(InvoiceController)
);

router.post(
  '/generate/invoice',
  authMiddleware(['super_admin', 'manager', 'front_desk']),
  joiValidationMiddleware(generateInvoiceSchema),
  InvoiceController.generateInvoice.bind(InvoiceController)
);

export default router;