import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';
import InternalServerError from '../error/InternalServerError';
import ConfigService from './ConfigService';
import {
  SendEmailOptions,
  ReservationConfirmationOptions,
  CheckInReminderOptions,
  PaymentConfirmationOptions,
  PaymentFailureOptions,
  CancellationNoticeOptions,
  CheckOutReminderOptions,
  INotificationService,
  TaskAssignmentOptions,
  InvoicePDFEmailOptions,
} from '../interfaces/notification';
import { sendReservationConfirmationTemplate } from '../templates/emailTemplates/sendReservationConfirmation';
import { sendCheckInReminderTemplate } from '../templates/emailTemplates/sendCheckInReminder';
import { sendPaymentConfirmationTemplate } from '../templates/emailTemplates/sendPaymentConfirmation';
import { sendPaymentFailureTemplate } from '../templates/emailTemplates/sendPaymentFailure';
import { sendCancellationNoticeTemplate } from '../templates/emailTemplates/sendCancellationNotice';
import { sendCheckOutReminderTemplate } from '../templates/emailTemplates/sendCheckOutReminder';
import { error } from 'console';
import { taskAssignmentTemplate } from 'src/templates/emailTemplates/taskAssignmentTemplate';
import { sendInvoiceEmailTemplate } from 'src/templates/emailTemplates/sendInvoiceEmailTemplate';

class NotificationService implements INotificationService {

  private async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const apiKey = await ConfigService.getConfig('SENDGRID_API_KEY');
      if (!apiKey) {
        throw new InternalServerError('SendGrid API key not configured', error as unknown as Error);
      }
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        to: options.email,
        from: 'no-reply@yourhotel.com',
        subject: options.subject,
        html: options.html,
      });
      logger.info(`Email sent to ${options.email}: ${options.subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${options.email}:`, error);
      throw new InternalServerError(
        'Failed to send email',
        error instanceof Error ? error : new Error('Email send failed'),
        { email: options.email, subject: options.subject },
        false
      );
    }
  }

  async sendReservationConfirmation(options: ReservationConfirmationOptions): Promise<void> {
    const html = sendReservationConfirmationTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `Reservation Confirmation - ${options.reservationId}`,
      html,
    });
  }

  async sendCheckInReminder(options: CheckInReminderOptions): Promise<void> {
    const html = sendCheckInReminderTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `Check-in Reminder for ${options.reservationId}`,
      html,
    });
  }

  async sendPaymentConfirmation(options: PaymentConfirmationOptions): Promise<void> {
    const html = sendPaymentConfirmationTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `Payment Confirmation - ${options.reservationId}`,
      html,
    });
  }

  async sendPaymentFailure(options: PaymentFailureOptions): Promise<void> {
    const html = sendPaymentFailureTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `Payment Failed - ${options.reservationId}`,
      html,
    });
  }

  async sendCancellationNotice(options: CancellationNoticeOptions): Promise<void> {
    const html = sendCancellationNoticeTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `Reservation Cancelled - ${options.reservationId}`,
      html,
    });
  }

  async sendCheckOutReminder(options: CheckOutReminderOptions): Promise<void> {
    const html = sendCheckOutReminderTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `Check-out Reminder for ${options.reservationId}`,
      html,
    });
  };

  async sendTaskAssignment(options: TaskAssignmentOptions): Promise<void> {
    const html = taskAssignmentTemplate(options);
    await this.sendEmail({
      email: options.email,
      subject: `New Task Assignment: ${options.taskType} for Room ${options.roomId}`,
      html,
    });
  }

async sendInvoiceWithPDF(options: InvoicePDFEmailOptions): Promise<void> {
  try {
    const apiKey = await ConfigService.getConfig('SENDGRID_API_KEY');
    if (!apiKey) throw new InternalServerError('SendGrid API key not configured', error as unknown as Error);

    const hotelName = await ConfigService.getConfig('HOTEL_NAME') || 'Grand Hotel';
    const logoUrl = await ConfigService.getConfig('HOTEL_LOGO_URL') || 'https://via.placeholder.com/150x60?text=LOGO';

    sgMail.setApiKey(apiKey);

    await sgMail.send({
      to: options.email,
      from: 'no-reply@yourhotel.com',
      subject: `Your Invoice - Reservation ${options.reservationId}`,
      html: sendInvoiceEmailTemplate({
        guestName: options.guestName,
        reservationId: options.reservationId,
        hotelName,
        logoUrl,
      }),
      attachments: [
        {
          content: options.pdfBuffer.toString('base64'),
          filename: options.fileName,
          type: 'application/pdf',
          disposition: 'inline',        
          contentId: 'invoice-pdf',    
        },
      ],
    });

    logger.info(`Invoice PDF emailed (with CID button) to ${options.email}`);
  } catch (error) {
    logger.error(`Failed to send invoice PDF email:`, error);
    throw new InternalServerError('Failed to send invoice email', error as Error);
  }
}

}

export default new NotificationService();