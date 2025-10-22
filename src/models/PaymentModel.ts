import { Schema, model } from 'mongoose';
import { IPayment } from '../interfaces/payment';

const paymentSchema = new Schema<IPayment>(
  {
    reservationId: { type: String, required: true },
    email: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending',
    },
    refunded: { type: Boolean, default: false },
    provider: { type: String, enum: ['Paystack'], default: 'Paystack' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', paymentSchema);