import { format } from 'date-fns';
import { PaymentConfirmationOptions } from '../../interfaces/notification';

export const sendPaymentConfirmationTemplate = (options: PaymentConfirmationOptions): string => {
  const formattedAmount = options.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #FFFFFF; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; border: 1px solid #2196F3; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .header { background-color: #2196F3; color: #FFFFFF; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .button { display: inline-block; background-color: #2196F3; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; font-size: 0.8em; color: #666666; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px; }
        .logo { max-width: 150px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${options.logoUrl}" class="logo" alt="${options.hotelName} Logo" />
          <h2>Payment Confirmation</h2>
        </div>
        <div class="content">
          <p>Hello ${options.guestName},</p>
          <p>Your payment of <strong>${formattedAmount}</strong> for reservation <strong>#${options.reservationId}</strong> at <strong>${options.hotelName}</strong> has been successfully processed.</p>
          <p>View your invoice here: <a href="${options.invoiceUrl}" class="button">View Invoice</a></p>
          <p>Thank you for choosing us!</p>
          <p>Best regards,<br>The <strong>${options.hotelName}</strong> Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} <strong>${options.hotelName}</strong>. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};