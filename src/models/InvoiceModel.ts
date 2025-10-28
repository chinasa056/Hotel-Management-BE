// src/models/InvoiceModel.ts
import { Schema, model } from 'mongoose';
import { IInvoice } from '../interfaces/invoice';

const invoiceSchema = new Schema<IInvoice>(
  {
    reservationId: { type: String, required: false, index: true }, // null for reports
    type: {
      type: String,
      enum: [
        'invoice',
        'revenue_report',
        'payment_status_report',
        'booking_financials',
        'refund_report',
        'availability_report',
      ],
      required: true,
    },
    fileName: { type: String, required: true },
    pdfData: { type: String, required: true }, // compressed + base64 PDF
    compressedHtml: { type: String }, // optional: for regeneration
    metadata: {
      generatedAt: { type: Date, default: Date.now },
      generatedBy: { type: String }, // userId
      filters: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);