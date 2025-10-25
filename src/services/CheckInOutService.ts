import { differenceInDays } from 'date-fns';
import SupabaseClientService from './SupabaseClientService';
import NotificationService from './NotificationService';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import BadRequestError from '../error/BadRequestError';
import InternalServerError from '../error/InternalServerError';
import { logger } from '../utils/logger';
import { CheckInOptions, CheckOutOptions, ICheckInOutService } from '../interfaces/checkInOut';

class CheckInOutService implements ICheckInOutService {
  async checkIn(options: CheckInOptions): Promise<void> {
    try {
      const { reservationId, checkInTime = new Date() } = options;
      // Fetch reservation with room_id
      const reservation = await SupabaseClientService.selectFromTable(
        'reservations',
        { id: reservationId },
        'id, guest_name, guest_email, check_in_date, check_out_date, room_details, status, room_id'
      );
      if (!reservation) {
        throw new ResourceNotFoundError(
          `Reservation ${reservationId} not found`,
          null,
          { reservationId },
          false
        );
      }

      // Validate reservation status
      if (reservation.status !== 'paid') {
        throw new BadRequestError(
          `Reservation must be paid to check in (current status: ${reservation.status})`,
          null,
          { reservationId, status: reservation.status },
          false
        );
      }

      // Validate check-in date
      const checkInDate = new Date(reservation.check_in_date);
      const today = new Date();
      if (differenceInDays(today, checkInDate) < 0) {
        throw new BadRequestError(
          'Check-in is only allowed on or after the check-in date',
          null,
          { reservationId, checkInDate: checkInDate.toISOString() },
          false
        );
      }

      // Optional: Cancel if past check-in date by too long (e.g., 1 day)
      if (differenceInDays(today, checkInDate) > 1) {
        await SupabaseClientService.updateTable('reservations', { status: 'cancelled' }, { id: reservationId });
        await NotificationService.sendCancellationNotice({
          guestName: reservation.guest_name,
          email: reservation.guest_email,
          reservationId,
          checkInDate,
          checkOutDate: new Date(reservation.check_out_date),
          reason: 'No-show after check-in date',
          hotelName: 'Your Hotel',
          logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
        });
        throw new InternalServerError(
          'Reservation cancelled due to no-show',
          new Error('No-show cancellation triggered'),
          { reservationId, checkInDate: checkInDate.toISOString() },
          false
        );
      }

      // Validate room status
      if (!reservation.room_id) {
        throw new BadRequestError(
          'Reservation missing room assignment',
          null,
          { reservationId },
          false
        );
      }
      const room = await SupabaseClientService.selectFromTable(
        'rooms',
        { id: reservation.room_id },
        'id, status'
      );
      if (!room) {
        throw new ResourceNotFoundError(
          `Room ${reservation.room_id} not found`,
          null,
          { reservationId, roomId: reservation.room_id },
          false
        );
      }
      if (room.status !== 'Vacant') {
        throw new BadRequestError(
          `Room is not vacant (current status: ${room.status})`,
          null,
          { reservationId, roomId: reservation.room_id, roomStatus: room.status },
          false
        );
      }

      // Update reservation and room status
      try {
        await SupabaseClientService.updateTable(
          'reservations',
          { status: 'checked_in', check_in_time: checkInTime.toISOString() },
          { id: reservationId }
        );
        await SupabaseClientService.updateTable(
          'rooms',
          { status: 'Occupied' },
          { id: reservation.room_id }
        );
        logger.info(`Checked in reservation ${reservationId}, set room ${reservation.room_id} to Occupied`);
      } catch (error) {
        throw new InternalServerError(
          'Failed to update reservation or room status',
          error instanceof Error ? error : new Error('Update failed'),
          { reservationId, roomId: reservation.room_id },
          false
        );
      }
    } catch (error) {
      logger.error(`Error checking in reservation ${options.reservationId}:`, error);
      throw error;
    }
  }

  async checkOut(options: CheckOutOptions): Promise<void> {
    try {
      const { reservationId, checkOutTime = new Date() } = options;
      // Fetch reservation with room_id
      const reservation = await SupabaseClientService.selectFromTable(
        'reservations',
        { id: reservationId },
        'id, guest_name, guest_email, check_in_date, check_out_date, room_details, status, room_id'
      );
      if (!reservation) {
        throw new ResourceNotFoundError(
          `Reservation ${reservationId} not found`,
          null,
          { reservationId },
          false
        );
      }

      // Validate reservation status
      if (reservation.status !== 'checked_in') {
        throw new BadRequestError(
          `Reservation must be checked in to check out (current status: ${reservation.status})`,
          null,
          { reservationId, status: reservation.status },
          false
        );
      }

      // Validate check-out date
      const checkOutDate = new Date(reservation.check_out_date);
      const today = new Date();
      if (differenceInDays(today, checkOutDate) !== 0) {
        throw new BadRequestError(
          'Check-out is only allowed on the check-out date',
          null,
          { reservationId, checkOutDate: checkOutDate.toISOString() },
          false
        );
      }

      // Validate room_id
      if (!reservation.room_id) {
        throw new BadRequestError(
          'Reservation missing room assignment',
          null,
          { reservationId },
          false
        );
      }

      // Update reservation and room status
      try {
        await SupabaseClientService.updateTable(
          'reservations',
          { status: 'checked_out', check_out_time: checkOutTime.toISOString() },
          { id: reservationId }
        );
        await SupabaseClientService.updateTable(
          'rooms',
          { status: 'Needs Cleaning' },
          { id: reservation.room_id }
        );
        // TODO: Trigger housekeeping task when HousekeepingService is implemented
        // HousekeepingService.createTask({ roomId: reservation.room_id, reservationId, taskType: 'cleaning', status: 'pending' });
        logger.info(`Checked out reservation ${reservationId}, set room ${reservation.room_id} to Needs Cleaning`);
      } catch (error) {
        throw new InternalServerError(
          'Failed to update reservation or room status',
          error instanceof Error ? error : new Error('Update failed'),
          { reservationId, roomId: reservation.room_id },
          false
        );
      }
    } catch (error) {
      logger.error(`Error checking out reservation ${options.reservationId}:`, error);
      throw error;
    }
  }
}

export default new CheckInOutService();


// import { differenceInDays } from 'date-fns';
// import SupabaseClientService from './SupabaseClientService';
// import NotificationService from './NotificationService';
// import HousekeepingService from './HousekeepingService';
// import ResourceNotFoundError from '../error/resourceNotFound';
// import BadRequestError from '../error/badRequest';
// import InternalServerError from '../error/internalServerError';
// import { logger } from '../utils/logger';
// import { CheckInOptions, CheckOutOptions, ICheckInOutService } from '../interfaces/checkInOut';

// class CheckInOutService implements ICheckInOutService {
//   async checkIn(options: CheckInOptions): Promise<void> {
//     try {
//       const { reservationId, checkInTime = new Date() } = options;
//       const reservation = await SupabaseClientService.selectFromTable(
//         'reservations',
//         { id: reservationId },
//         'id, guest_name, guest_email, check_in_date, check_out_date, room_details, status, room_id'
//       );
//       if (!reservation) {
//         throw new ResourceNotFoundError(
//           `Reservation ${reservationId} not found`,
//           null,
//           { reservationId },
//           false
//         );
//       }

//       if (reservation.status !== 'paid') {
//         throw new BadRequestError(
//           `Reservation must be paid to check in (current status: ${reservation.status})`,
//           null,
//           { reservationId, status: reservation.status },
//           false
//         );
//       }

//       const checkInDate = new Date(reservation.check_in_date);
//       const today = new Date();
//       if (differenceInDays(today, checkInDate) < 0) {
//         throw new BadRequestError(
//           'Check-in is only allowed on or after the check-in date',
//           null,
//           { reservationId, checkInDate: checkInDate.toISOString() },
//           false
//         );
//       }

//       if (differenceInDays(today, checkInDate) > 1) {
//         await SupabaseClientService.updateTable('reservations', { status: 'cancelled' }, { id: reservationId });
//         await NotificationService.sendCancellationNotice({
//           guestName: reservation.guest_name,
//           email: reservation.guest_email,
//           reservationId,
//           checkInDate,
//           checkOutDate: new Date(reservation.check_out_date),
//           reason: 'No-show after check-in date',
//           hotelName: 'Your Hotel',
//           logoUrl: 'https://via.placeholder.com/150?text=Hotel+Logo',
//         });
//         throw new InternalServerError(
//           'Reservation cancelled due to no-show',
//           new Error('No-show cancellation triggered'),
//           { reservationId, checkInDate: checkInDate.toISOString() },
//           false
//         );
//       }

//       if (!reservation.room_id) {
//         throw new BadRequestError(
//           'Reservation missing room assignment',
//           null,
//           { reservationId },
//           false
//         );
//       }
//       const room = await SupabaseClientService.selectFromTable(
//         'rooms',
//         { id: reservation.room_id },
//         'id, status'
//       );
//       if (!room) {
//         throw new ResourceNotFoundError(
//           `Room ${reservation.room_id} not found`,
//           null,
//           { reservationId, roomId: reservation.room_id },
//           false
//         );
//       }
//       if (room.status !== 'Vacant') {
//         throw new BadRequestError(
//           `Room is not vacant (current status: ${room.status})`,
//           null,
//           { reservationId, roomId: reservation.room_id, roomStatus: room.status },
//           false
//         );
//       }

//       try {
//         await SupabaseClientService.updateTable(
//           'reservations',
//           { status: 'checked_in', check_in_time: checkInTime.toISOString() },
//           { id: reservationId }
//         );
//         await SupabaseClientService.updateTable(
//           'rooms',
//           { status: 'Occupied' },
//           { id: reservation.room_id }
//         );
//         logger.info(`Checked in reservation ${reservationId}, set room ${reservation.room_id} to Occupied`);
//       } catch (error) {
//         throw new InternalServerError(
//           'Failed to update reservation or room status',
//           error instanceof Error ? error : new Error('Update failed'),
//           { reservationId, roomId: reservation.room_id },
//           false
//         );
//       }
//     } catch (error) {
//       logger.error(`Error checking in reservation ${options.reservationId}:`, error);
//       throw error;
//     }
//   }

//   async checkOut(options: CheckOutOptions): Promise<void> {
//     try {
//       const { reservationId, checkOutTime = new Date() } = options;
//       const reservation = await SupabaseClientService.selectFromTable(
//         'reservations',
//         { id: reservationId },
//         'id, guest_name, guest_email, check_in_date, check_out_date, room_details, status, room_id'
//       );
//       if (!reservation) {
//         throw new ResourceNotFoundError(
//           `Reservation ${reservationId} not found`,
//           null,
//           { reservationId },
//           false
//         );
//       }

//       if (reservation.status !== 'checked_in') {
//         throw new BadRequestError(
//           `Reservation must be checked in to check out (current status: ${reservation.status})`,
//           null,
//           { reservationId, status: reservation.status },
//           false
//         );
//       }

//       const checkOutDate = new Date(reservation.check_out_date);
//       const today = new Date();
//       if (differenceInDays(today, checkOutDate) !== 0) {
//         throw new BadRequestError(
//           'Check-out is only allowed on the check-out date',
//           null,
//           { reservationId, checkOutDate: checkOutDate.toISOString() },
//           false
//         );
//       }

//       if (!reservation.room_id) {
//         throw new BadRequestError(
//           'Reservation missing room assignment',
//           null,
//           { reservationId },
//           false
//         );
//       }

//       try {
//         await SupabaseClientService.updateTable(
//           'reservations',
//           { status: 'checked_out', check_out_time: checkOutTime.toISOString() },
//           { id: reservationId }
//         );
//         await SupabaseClientService.updateTable(
//           'rooms',
//           { status: 'Needs Cleaning' },
//           { id: reservation.room_id }
//         );

//         // Trigger housekeeping task
//         await HousekeepingService.createTask({
//           room_id: reservation.room_id,
//           reservation_id: reservationId,
//           task_type: 'cleaning',
//         });

//         logger.info(`Checked out reservation ${reservationId}, set room ${reservation.room_id} to Needs Cleaning, created task`);
//       } catch (error) {
//         throw new InternalServerError(
//           'Failed to update reservation, room status, or create task',
//           error instanceof Error ? error : new Error('Update failed'),
//           { reservationId, roomId: reservation.room_id },
//           false
//         );
//       }
//     } catch (error) {
//       logger.error(`Error checking out reservation ${options.reservationId}:`, error);
//       throw error;
//     }
//   }
// }

// export default new CheckInOutService();