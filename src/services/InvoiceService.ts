// src/services/InvoiceService.ts
import puppeteer from 'puppeteer';
import SupabaseClientService from './SupabaseClientService';
import CompressionService from './CompressionService';
import InvoiceRepository from '../repositories/InvoiceRepository';
import { IInvoice, IInvoiceData } from '../interfaces/invoice';
import { generatePdfBuffer } from '../utils/pdfUtils';
import { invoiceHtmlTemplate } from '../templates/pdf/invoiceTemplate';
import { revenueReportHtml } from '../templates/pdf/reportTemplates';
import NotificationService from './NotificationService';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import InternalServerError from '../error/InternalServerError';
import { logger } from '../utils/logger';
import PaymentRepository from '../repositories/PaymentRepository';
import e from 'express';
import { error } from 'console';

class InvoiceService {
  private invoiceRepository: typeof InvoiceRepository;

  constructor(invoiceRepository: typeof InvoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  private async getPdfData(pdfBuffer: Buffer): Promise<string> {
    const compressed = await CompressionService.compress(pdfBuffer.toString('binary'));
    return compressed!;
  }

  async generateInvoicePDF(reservationId: string, userId?: string): Promise<string> {
    try {
      const reservation = await SupabaseClientService.selectFromTable('reservations', { id: reservationId });
      if (!reservation) throw new ResourceNotFoundError(`Reservation ${reservationId} not found`, null, {});

      const payment = await PaymentRepository.prototype.findPaymentByReference(reservation.payment_reference);
      if (!payment) throw new ResourceNotFoundError(`Payment not found`, null, {});

      const room = await SupabaseClientService.selectFromTable('rooms', { id: reservation.room_id });
      if (!room) throw new ResourceNotFoundError(`Room not found`, null, {});

      const html = invoiceHtmlTemplate(reservation, payment, room);
      const pdfBuffer = await generatePdfBuffer(html);
      const pdfData = await this.getPdfData(pdfBuffer);

      const invoiceData: IInvoiceData = {
        reservationId,
        type: 'invoice',
        fileName: `invoice-${reservationId}.pdf`,
        pdfData,
        compressedHtml: await CompressionService.compress(html),
        metadata: { generatedBy: userId },
      };

      const invoice = await this.invoiceRepository.createInvoice(invoiceData);
      return invoice._id as string;
    } catch (error) {
      logger.error(`Invoice PDF generation failed for ${reservationId}:`, error);
      throw new InternalServerError('Failed to generate invoice PDF', error as Error);
    }
  }

  async generateReportPDF(type: string, filters: any, userId: string): Promise<string> {
    // Placeholder: integrate with FinancialReportService
    const mockData = { total: 50000, start: '2025-10-01', end: '2025-10-28', breakdown: [] };
    const html = revenueReportHtml(mockData);
    const pdfBuffer = await generatePdfBuffer(html);
    const pdfData = await this.getPdfData(pdfBuffer);

    const invoiceData: IInvoiceData = {
      type: type as any,
      fileName: `${type.replace('_', '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
      pdfData,
      metadata: { generatedBy: userId, filters },
    };

    const invoice = await this.invoiceRepository.createInvoice(invoiceData);
    return invoice._id as string;
  }

  async getPDF(invoiceId: string): Promise<{ buffer: Buffer; fileName: string }> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) throw new ResourceNotFoundError(`PDF not found`, null, {});

    const compressedBuffer = Buffer.from(invoice.pdfData, 'base64');
    const pdfBuffer = await CompressionService.decompress(compressedBuffer.toString('base64'));
    if (!pdfBuffer) throw new InternalServerError('Failed to decompress PDF', error as unknown as Error);

    return {
      buffer: Buffer.from(pdfBuffer, 'binary'),
      fileName: invoice.fileName,
    };
  }

  async sendInvoiceEmail(reservationId: string): Promise<void> {
    const invoiceId = await this.generateInvoicePDF(reservationId);
    const { buffer, fileName } = await this.getPDF(invoiceId);

    const reservation = await SupabaseClientService.selectFromTable('reservations', { id: reservationId });
    await NotificationService.sendInvoiceWithPDF({
      email: reservation.guest_email,
      reservationId,
      guestName: reservation.guest_name,
      pdfBuffer: buffer,
      fileName,
    });
  }
}

export default new InvoiceService(InvoiceRepository);