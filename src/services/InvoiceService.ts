import puppeteer from 'puppeteer';
import SupabaseClientService from './SupabaseClientService';
import CompressionService from './CompressionService';
import InvoiceRepository from '../repositories/InvoiceRepository';
import { IInvoice, IInvoiceData } from '../interfaces/invoice';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import InternalServerError from '../error/InternalServerError';
import { logger } from '../utils/logger';
import { error } from 'console';
import PaymentRepository from 'src/repositories/PaymentRepository';

class InvoiceService {
    private invoiceRepository: InvoiceRepository;

    constructor(invoiceRepository: InvoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    private generateInvoiceHtml(reservation: any, payment: any): string {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .invoice { max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; }
            .header { text-align: center; }
            .details { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>Hotel Invoice</h1>
              <p>Reservation ID: ${reservation.id}</p>
            </div>
            <div class="details">
              <p><strong>Guest Name:</strong> ${payment.customerName}</p>
              <p><strong>Email:</strong> ${payment.email}</p>
              <p><strong>Amount:</strong> $${(payment.amount / 100).toFixed(2)}</p>
              <p><strong>Payment Reference:</strong> ${payment.reference}</p>
              <p><strong>Status:</strong> ${payment.status}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }

    async generateAndStoreInvoice(reservationId: string): Promise<IInvoice> {
        try {
            const reservation = await SupabaseClientService.selectFromTable('reservations', { id: reservationId }, 'id, amount, guest_email, guest_name, status');
            if (!reservation) {
                throw new ResourceNotFoundError(`Reservation ${reservationId} not found`, null, error);
            }

            const payment = await PaymentRepository.prototype.findPaymentByReference(reservation.payment_reference);
            if (!payment) {
                throw new ResourceNotFoundError(`Payment for reservation ${reservationId} not found`, null, error);
            }

            const html = this.generateInvoiceHtml(reservation, payment);
            const compressedHtml = await CompressionService.compress(html);

            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            //   await page.setContent(html);
            //   const pdfBuffer = await page.pdf({ format: 'A4' });
            //   await browser.close();

            //   const storagePath = `invoices/${reservationId}/${Date.now()}.pdf`;
            //   const publicUrl = await SupabaseClientService.uploadToStorage('invoices', storagePath, pdfBuffer, { contentType: 'application/pdf' });

            // InvoiceService.ts
            // ...
            await page.setContent(html);
            const pdfBuffer = await page.pdf({ format: 'A4' });

            //  Explicitly cast the buffer to the Node.js Buffer type
            const uploadBuffer: Buffer = pdfBuffer as Buffer;

            await browser.close();

            const storagePath = `invoices/${reservationId}/${Date.now()}.pdf`;
            const publicUrl = await SupabaseClientService.uploadToStorage('invoices', storagePath, uploadBuffer, { contentType: 'application/pdf' });

            const invoiceData: IInvoiceData = {
                reservationId,
                storagePath: publicUrl,
                compressedHtml,
                createdAt: new Date(),
            };

            const invoice = await this.invoiceRepository.createInvoice(invoiceData);
            return invoice;
        } catch (error) {
            logger.error(`Error generating invoice for reservation ${reservationId}:`, error);
            throw new InternalServerError('Failed to generate invoice', error as Error);
        }
    }

    async getInvoice(reservationId: string): Promise<IInvoice> {
        try {
            const invoice = await this.invoiceRepository.findInvoiceByReservationId(reservationId);
            if (!invoice) {
                throw new ResourceNotFoundError(`Invoice for reservation ${reservationId} not found`, null, error);
            }
            return invoice;
        } catch (error) {
            logger.error(`Error fetching invoice for reservation ${reservationId}:`, error);
            throw error;
        }
    }
}

export default new InvoiceService(new InvoiceRepository());