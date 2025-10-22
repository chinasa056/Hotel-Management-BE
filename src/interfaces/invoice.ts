import { Document } from 'mongoose';

export interface IInvoiceData {
 reservationId: string;
 storagePath: string; 
 compressedHtml?: string | null; 
 createdAt: Date;
}

export interface IInvoice extends IInvoiceData, Document {
  
}