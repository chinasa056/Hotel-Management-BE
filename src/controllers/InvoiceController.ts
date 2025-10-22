import { NextFunction, Request, Response } from 'express';
import InvoiceService from '../services/InvoiceService';
import { responseHandler } from '../utils/responseHandler';
import { IInvoice } from '../interfaces/invoice';

class InvoiceController {
  private invoiceService: typeof InvoiceService;

  constructor(invoiceService: typeof InvoiceService) {
    this.invoiceService = invoiceService;
  }

  async getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reservationId } = req.params;
      const invoice: IInvoice = await this.invoiceService.getInvoice(reservationId);
      res.status(200).json(responseHandler({ storagePath: invoice.storagePath }, 'Invoice fetched successfully'));
    } catch (error) {
next(error);
    }
  }
}

export default new InvoiceController(InvoiceService);