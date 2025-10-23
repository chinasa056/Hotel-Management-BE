import { NextFunction, Request, Response } from 'express';
import { differenceInDays } from 'date-fns';
import NotificationService from '../services/NotificationService';
import SupabaseClientService from '../services/SupabaseClientService';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import InternalServerError from '../error/InternalServerError';
import { CheckInReminderOptions, CheckOutReminderOptions } from '../interfaces/notification';
import { error } from 'console';

class NotificationController {
  private notificationService: typeof NotificationService;

  constructor(notificationService: typeof NotificationService) {
    this.notificationService = notificationService;
  }

  async sendCheckInReminder(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const { reservationId } = req.params;
      const reservation = await SupabaseClientService.selectFromTable('reservations', { id: reservationId }, 'id, guest_name, guest_email, check_in_date, room_details');
      if (!reservation) {
        throw new ResourceNotFoundError(`Reservation ${reservationId} not found`, null);
      }

      const checkInDate = new Date(reservation.check_in_date);
      const today = new Date();
      if (differenceInDays(checkInDate, today) !== 1) {
        throw new InternalServerError('Check-in reminder can only be sent one day before check-in', Error as unknown as Error);
      }

      const options: CheckInReminderOptions = {
        guestName: reservation.guest_name,
        email: reservation.guest_email,
        reservationId,
        checkInDate,
        roomDetails: reservation.room_details,
        hotelName: 'Your Hotel',
        logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
      };

      await this.notificationService.sendCheckInReminder(options);
      res.status(200).json({message: 'Check-in reminder sent successfully'});
    } catch (error) {
  next(error);
    }
  }

  async sendCheckOutReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reservationId } = req.params;
      const reservation = await SupabaseClientService.selectFromTable('reservations', { id: reservationId }, 'id, guest_name, guest_email, check_out_date, room_details');
      if (!reservation) {
        throw new ResourceNotFoundError(`Reservation ${reservationId} not found`, null);
      }

      const checkOutDate = new Date(reservation.check_out_date);
      const today = new Date();
      if (differenceInDays(checkOutDate, today) !== 0) {
        throw new InternalServerError('Check-out reminder can only be sent on the check-out date', error as unknown as Error);
      }

      const options: CheckOutReminderOptions = {
        guestName: reservation.guest_name,
        email: reservation.guest_email,
        reservationId,
        checkOutDate,
        roomDetails: reservation.room_details,
        hotelName: 'Your Hotel',
        logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
      };

      await this.notificationService.sendCheckOutReminder(options);
      res.status(200).json({message: 'Check-out reminder sent successfully'});
    } catch (error) {
next(error);
    }
  }
}

export default new NotificationController(NotificationService);