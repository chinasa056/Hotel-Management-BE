// src/interfaces/invoice.ts
import { Document } from 'mongoose';

export interface IInvoiceData {
  reservationId?: string;
  type: 'invoice' | 'revenue_report' | 'payment_status_report' | 'booking_financials' | 'refund_report' | 'availability_report';
  fileName: string;
  pdfData: string;
  compressedHtml?: string | null;
  metadata?: {
    generatedAt?: Date;
    generatedBy?: string;
    filters?: Record<string, any>;
  };
}

export interface IInvoice extends IInvoiceData, Document {}