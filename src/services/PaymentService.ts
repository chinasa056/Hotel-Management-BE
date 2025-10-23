import PaymentRepository from '../repositories/PaymentRepository';
import SupabaseClientService from './SupabaseClientService';
import PaymentGatewayService from './PaymentGatewayService';
import InvoiceService from './InvoiceService';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import InternalServerError from '../error/InternalServerError';
import { logger } from '../utils/logger';
import { IPaymentAttributes, PaymentInitializationResponse, PaymentVerificationResponse } from '../interfaces/payment';
import { error } from 'console';
import NotificationService from './NotificationService';

class PaymentService {
    private paymentRepository: PaymentRepository;

    constructor(paymentRepository: PaymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async initializePayment(reservationId: string, userId: string): Promise<PaymentInitializationResponse> {
        try {
            const reservation = await SupabaseClientService.selectFromTable('reservations', { id: reservationId }, 'id, amount, guest_email, status, guest_name');
            if (!reservation) {
                throw new ResourceNotFoundError(`Reservation ${reservationId} not found`, null, {});
            }
            if (reservation.status === 'paid') {
                throw new InternalServerError('Reservation is already paid', error as unknown as Error);
            }

            const transaction = await PaymentGatewayService.initializeTransaction(
                reservation.amount,
                reservation.guest_email,
                { reservationId }
            );

            const paymentData: IPaymentAttributes = {
                reservationId,
                email: reservation.guest_email,
                customerName: reservation.guest_name,
                amount: reservation.amount,
                reference: transaction.reference,
                status: 'Pending',
                refunded: false,
                provider: 'Paystack',
                createdAt: new Date(),
            };

            const payment = await this.paymentRepository.createPayment(paymentData);

            await SupabaseClientService.updateTable('reservations', { payment_reference: transaction.reference, status: 'awaiting_payment' }, { id: reservationId });

            return {
                message: 'Payment initialization successful',
                data: {
                    authorization_url: transaction.authorization_url,
                    reference: transaction.reference,
                    transactionDetails: payment,
                },
            };
        } catch (error) {
            logger.error(`Error initializing payment for reservation ${reservationId}:`, error);
            throw error;
        }
    }

    async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
        try {
            const payment = await this.paymentRepository.findPaymentByReference(reference);
            if (!payment) {
                throw new ResourceNotFoundError(`Payment with reference ${reference} not found`, null, {});
            }

            if (payment.status === 'Success') {
                const reservation = await SupabaseClientService.selectFromTable('reservations', { id: payment.reservationId });
                return {
                    message: 'Payment already verified',
                    data: { payment, reservation },
                };
            }

            const transaction = await PaymentGatewayService.verifyTransaction(reference);

            const reservation = await SupabaseClientService.selectFromTable('reservations', { id: payment.reservationId }, 'id, guest_name, guest_email, room_details');

            if (transaction.status !== 'success') {
                const updatedPayment = await this.paymentRepository.updatePayment(reference, { status: 'Failed' });

                const updatedReservation = await SupabaseClientService.updateTable('reservations', { status: 'payment_failed' }, { id: payment.reservationId });

                await NotificationService.sendPaymentFailure({
                    guestName: reservation.guest_name,
                    email: reservation.guest_email,
                    amount: payment.amount,
                    reservationId: payment.reservationId,
                    paymentLink: transaction.authorization_url || `https://yourhotel.com/payment/${reference}`,
                    hotelName: 'Your Hotel',
                    logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
                });

                return {
                    message: 'Payment failed',
                    data: { payment: updatedPayment!, reservation: updatedReservation },
                };
            } else {

                const updatedPayment = await this.paymentRepository.updatePayment(reference, { status: 'Success' });
                await SupabaseClientService.updateTable('reservations', { status: 'paid' }, { id: payment.reservationId });

                const invoiceUrl = await InvoiceService.generateAndStoreInvoice(payment.reservationId);

                await NotificationService.sendPaymentConfirmation({
                    guestName: reservation.guest_name,
                    email: reservation.guest_email,
                    amount: payment.amount,
                    reservationId: payment.reservationId,
                    invoiceUrl,
                    hotelName: 'Your Hotel',
                    logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
                });

                return {
                    message: 'Payment verified successfully',
                    data: { payment: updatedPayment!, reservation },
                };
            }

        } catch (error) {
            logger.error(`Error verifying payment ${reference}:`, error);
            throw error;
        }
    }
}

export default new PaymentService(new PaymentRepository());
