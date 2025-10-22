import { Model } from 'mongoose';
import { IInvoice, IInvoiceData } from '../interfaces/invoice'; 
import { Invoice } from '../models/InvoiceModel';

class InvoiceRepository {
  private model: Model<IInvoice>;

  constructor() {
    this.model = Invoice;
  }

  async createInvoice(invoiceData: IInvoiceData): Promise<IInvoice> {
    return await this.model.create(invoiceData);
  }

  async findInvoiceByReservationId(reservationId: string): Promise<IInvoice | null> {
    return await this.model.findOne({ reservationId });
  }
}

export default InvoiceRepository;
