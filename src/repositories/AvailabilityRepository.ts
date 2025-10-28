import SupabaseClientService from '../services/SupabaseClientService';
import {
  AvailabilityFilters,
  AvailabilityResponse,
  AvailabilitySummaryResponse,
  RoomDayAvailabilityResponse,
  SingleDateAvailabilityResponse
} from '../interfaces/availability';
import { logger } from '../utils/logger';
import InternalServerError from '../error/InternalServerError';
import { parseISO, isWithinInterval, eachDayOfInterval, format } from 'date-fns';
import { error } from 'console';

class AvailabilityRepository {
  async getAvailableRooms(filters: AvailabilityFilters): Promise<AvailabilityResponse> {
    try {
      const { start_date, end_date, room_type, room_id, status, page = 1, limit = 10 } = filters;

      // Fetch all rooms
      let roomQuery: any = {};
      if (room_type) roomQuery.room_type = room_type;
      if (room_id) roomQuery.id = room_id;
      if (status) roomQuery.status = status;
      const rooms = await SupabaseClientService.selectFromTable('rooms', roomQuery, 'id, room_type, status, rate');
      const roomIds = rooms.map((room: any) => room.id);

      // Fetch conflicting reservations
      const reservationQuery: any = {
        room_id: roomIds,
        status: ['pending', 'paid', 'checked_in']
      };
      if (start_date && end_date) {
        reservationQuery.check_in_date = { lte: end_date };
        reservationQuery.check_out_date = { gte: start_date };
      }
      const reservations = await SupabaseClientService.selectFromTable(
        'reservations',
        reservationQuery,
        'id, room_id, check_in_date, check_out_date'
      );

      // Filter available rooms
      const startDate = start_date ? parseISO(start_date) : undefined;

      const endDate = end_date ? parseISO(end_date) : undefined;

      const availableRooms = rooms.filter((room: any) => {
        const conflicting = reservations.some((res: any) => {
          if (res.room_id !== room.id) return false;

          const checkIn = parseISO(res.check_in_date);
          const checkOut = parseISO(res.check_out_date);

          if (!startDate || !endDate) return false;

          return (
            (startDate && endDate && isWithinInterval(startDate, { start: checkIn, end: checkOut })) ||
            isWithinInterval(endDate, { start: checkIn, end: checkOut }) ||
            (checkIn <= startDate && checkOut >= endDate)
          );
        });
        return !conflicting;
      });

      const total = availableRooms.length;
      const paginated = availableRooms.slice((page - 1) * limit, page * limit);

      return {
        available_rooms: paginated.map((room: any) => ({
          room_id: room.id,
          room_type: room.room_type,
          status: room.status,
          rate: room.rate
        })),
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error fetching available rooms:', error);
      throw new InternalServerError(
        'Failed to fetch available rooms',
        error instanceof Error ? error : new Error('Availability fetch failed'),
        { filters },
        false
      );
    }
  }

  async getAvailabilitySummary(filters: AvailabilityFilters): Promise<AvailabilitySummaryResponse> {
    try {
      const { start_date, end_date } = filters;

      // Fetch all rooms
      const rooms = await SupabaseClientService.selectFromTable('rooms', {}, 'id, room_type');

      // Fetch conflicting reservations
      const reservationQuery: any = {
        status: ['pending', 'paid', 'checked_in']
      };
      if (start_date && end_date) {
        reservationQuery.check_in_date = { lte: end_date };
        reservationQuery.check_out_date = { gte: start_date };
      }
      const reservations = await SupabaseClientService.selectFromTable(
        'reservations',
        reservationQuery,
        'id, room_id, check_in_date, check_out_date'
      );

      // Filter available rooms
      const startDate = start_date ? parseISO(start_date) : undefined;
      const endDate = end_date ? parseISO(end_date) : undefined;
      const availableRoomIds = new Set(
        rooms
          .filter((room: any) => {
            const conflicting = reservations.some((res: any) => {
              if (res.room_id !== room.id) return false;
              const checkIn = parseISO(res.check_in_date);
              const checkOut = parseISO(res.check_out_date);
              return (
                startDate &&
                endDate &&
                (isWithinInterval(startDate, { start: checkIn, end: checkOut }) ||
                  isWithinInterval(endDate, { start: checkIn, end: checkOut }) ||
                  (checkIn <= startDate && checkOut >= endDate))
              );
            });
            return !conflicting;
          })
          .map((room: any) => room.id)
      );

      // Summarize by room type
      const roomTypeCounts = rooms.reduce((acc: { [key: string]: number }, room: any) => {
        if (availableRoomIds.has(room.id)) {
          acc[room.room_type] = (acc[room.room_type] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        room_types: Object.entries(roomTypeCounts).map(([room_type, count]) => ({ room_type, count: parseInt(count as any) }))
      };
    } catch (error) {
      logger.error('Error fetching availability summary:', error);
      throw new InternalServerError(
        'Failed to fetch availability summary',
        error instanceof Error ? error : new Error('Summary fetch failed'),
        { filters },
        false
      );
    }
  }

  async getRoomDayAvailability(filters: AvailabilityFilters): Promise<RoomDayAvailabilityResponse> {
    try {
      const { room_id, start_date, end_date } = filters;

      if (!room_id || !start_date || !end_date) {
        throw new InternalServerError('Missing required filters: room_id, start_date, end_date', error as unknown as any, { filters }, false);
      }

      const startDate = parseISO(start_date);
      const endDate = parseISO(end_date);
      const reservations = await SupabaseClientService.selectFromTable(
        'reservations',
        {
          room_id,
          status: ['pending', 'paid', 'checked_in'],
          check_in_date: { lte: end_date },
          check_out_date: { gte: start_date }
        },
        'id, check_in_date, check_out_date'
      );

      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const availableDates = days
        .filter((day) => {
          return !reservations.some((res: any) => {
            const checkIn = parseISO(res.check_in_date);
            const checkOut = parseISO(res.check_out_date);
            return (
              isWithinInterval(day, { start: checkIn, end: checkOut }) ||
              (checkIn.getTime() === day.getTime() && checkOut.getTime() === day.getTime())
            );
          });
        })
        .map((day) => format(day, 'yyyy-MM-dd'));

      return { room_id, available_dates: availableDates };
    } catch (error) {
      logger.error('Error fetching room day availability:', error);
      throw new InternalServerError(
        'Failed to fetch room day availability',
        error instanceof Error ? error : new Error('Room day fetch failed'),
        { filters },
        false
      );
    }
  }

  async getSingleDateAvailability(filters: AvailabilityFilters): Promise<SingleDateAvailabilityResponse> {
    try {
      const { date, room_id } = filters;

      if (!date) {
        throw new Error('Missing required filter: date');
        // throw new InternalServerError('Missing required filter: date', error instanceof Error ? error : new Error('Create task failed'), { filters }, false);
      }

      const targetDate = parseISO(date);
      const reservationQuery: any = {
        status: ['pending', 'paid', 'checked_in'],
        check_in_date: { lte: date },
        check_out_date: { gte: date }
      };
      if (room_id) reservationQuery.room_id = room_id;

      const reservations = await SupabaseClientService.selectFromTable('reservations', reservationQuery, 'id, room_id');

      if (room_id) {
        const reservation = reservations.find((res: any) => res.room_id === room_id);
        return reservation ? { status: 'booked', room_id, reservation_id: reservation.id } : { status: 'free', room_id };
      } else {
        return reservations.length > 0 ? { status: 'booked', reservation_id: reservations[0].id } : { status: 'free' };
      }
    } catch (error) {
      logger.error('Error fetching single date availability:', error);
      throw new InternalServerError(
        'Failed to fetch single date availability',
        error instanceof Error ? error : new Error('Single date fetch failed'),
        { filters },
        false
      );
    }
  }
}

export default new AvailabilityRepository();
