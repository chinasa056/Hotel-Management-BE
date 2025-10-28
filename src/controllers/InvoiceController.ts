// src/controllers/InvoiceController.ts
import { Request, Response, NextFunction } from 'express';
import InvoiceService from '../services/InvoiceService';
import { responseHandler } from '../utils/responseHandler';

class InvoiceController {
  private invoiceService: typeof InvoiceService;

  constructor(invoiceService: typeof InvoiceService) {
    this.invoiceService = invoiceService;
  }

  async getPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invoiceId } = req.params;
      const { buffer, fileName } = await this.invoiceService.getPDF(invoiceId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reservationId } = req.body;
      const userId = req.user?.id;
      const invoiceId = await this.invoiceService.generateInvoicePDF(reservationId, userId);
      res.status(201).json(responseHandler({ invoiceId }, 'Invoice PDF generated'));
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController(InvoiceService);