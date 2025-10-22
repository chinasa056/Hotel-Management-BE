import { Schema, model } from 'mongoose';
import { IInvoice } from '../interfaces/invoice';

const invoiceSchema = new Schema<IInvoice>(
  {
    reservationId: { type: String, required: true },
    storagePath: { type: String, required: true },
    compressedHtml: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);