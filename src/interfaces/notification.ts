import { IInvoice } from "./invoice";

export interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

export interface ReservationConfirmationOptions {
  guestName: string;
  email: string;
  reservationId: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomDetails: string;
  hotelName: string;
  logoUrl: string;
}

export interface CheckInReminderOptions {
  guestName: string;
  email: string;
  reservationId: string;
  checkInDate: Date;
  roomDetails: string;
  hotelName: string;
  logoUrl: string;
}

export interface PaymentConfirmationOptions {
  guestName: string;
  email: string;
  amount: number;
  reservationId: string;
  invoiceUrl: IInvoice;
  hotelName: string;
  logoUrl: string;
}

export interface PaymentFailureOptions {
  guestName: string;
  email: string;
  amount: number;
  reservationId: string;
  paymentLink: string;
  hotelName: string;
  logoUrl: string;
}

export interface CancellationNoticeOptions {
  guestName: string;
  email: string;
  reservationId: string;
  checkInDate: Date;
  checkOutDate: Date;
  reason: string;
  hotelName: string;
  logoUrl: string;
}

export interface CheckOutReminderOptions {
  guestName: string;
  email: string;
  reservationId: string;
  checkOutDate: Date;
  roomDetails: string;
  hotelName: string;
  logoUrl: string;
}

export interface INotificationService {
  sendReservationConfirmation(options: ReservationConfirmationOptions): Promise<void>;
  sendCheckInReminder(options: CheckInReminderOptions): Promise<void>;
  sendPaymentConfirmation(options: PaymentConfirmationOptions): Promise<void>;
  sendPaymentFailure(options: PaymentFailureOptions): Promise<void>;
  sendCancellationNotice(options: CancellationNoticeOptions): Promise<void>;
  sendCheckOutReminder(options: CheckOutReminderOptions): Promise<void>;
}