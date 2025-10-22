import { Document } from 'mongoose';

export interface IPaymentAttributes {
  reservationId: string;
  email: string;
  customerName: string;
  amount: number;
  reference: string;
  status: 'Pending' | 'Success' | 'Failed';
  refunded: boolean;
  provider: 'Paystack';
  createdAt: Date;
}

export interface IPayment extends Document, IPaymentAttributes {}

export interface PaymentInitializationResponse {
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    transactionDetails: IPayment;
  };
}

export interface PaymentVerificationResponse {
  message: string;
  data?: {
    payment: IPayment;
    reservation?: any; 
  };
}

export interface IPaymentService {
  initializePayment(reservationId: string, userId: string): Promise<PaymentInitializationResponse>;
  verifyPayment(reference: string): Promise<PaymentVerificationResponse>;
}