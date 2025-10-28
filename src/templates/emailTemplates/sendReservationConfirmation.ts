import { format } from 'date-fns';
import { ReservationConfirmationOptions } from '../../interfaces/notification';

export const sendReservationConfirmationTemplate = (options: ReservationConfirmationOptions): string => {
  const formattedCheckIn = format(options.checkInDate, 'PPPP');
  const formattedCheckOut = format(options.checkOutDate, 'PPPP');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #FFFFFF; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; border: 1px solid #2196F3; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .header { background-color: #2196F3; color: #FFFFFF; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 0.8em; color: #666666; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px; }
        .logo { max-width: 150px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${options.logoUrl}" class="logo" alt="${options.hotelName} Logo" />
          <h2>Reservation Confirmation</h2>
        </div>
        <div class="content">
          <p>Hello ${options.guestName},</p>
          <p>Your reservation <strong>#${options.reservationId}</strong> at <strong>${options.hotelName}</strong> has been confirmed.</p>
          <p><strong>Check-in:</strong> ${formattedCheckIn}</p>
          <p><strong>Check-out:</strong> ${formattedCheckOut}</p>
          <p><strong>Room:</strong> ${options.roomDetails}</p>
          <p>We look forward to welcoming you! Please contact us if you have any questions.</p>
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