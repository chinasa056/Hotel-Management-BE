import AvailabilityRepository from '../repositories/AvailabilityRepository';
import { AvailabilityFilters, AvailabilityResponse, AvailabilitySummaryResponse, RoomDayAvailabilityResponse, SingleDateAvailabilityResponse, IAvailabilityService } from '../interfaces/availability';
import BadRequestError from '../error/BadRequestError';
import { logger } from '../utils/logger';
import { parseISO } from 'date-fns';

class AvailabilityService implements IAvailabilityService {
  async getAvailableRooms(filters: AvailabilityFilters): Promise<AvailabilityResponse> {
    try {
      const { start_date, end_date, status } = filters;

      if (!start_date || !end_date) {
        throw new BadRequestError('Missing required filters: start_date, end_date', null, { start_date, end_date }, false);
      }

      if (parseISO(start_date) >= parseISO(end_date)) {
        throw new BadRequestError('start_date must be before end_date', null, { start_date, end_date }, false);
      }

      if (status && !['Vacant', 'Occupied', 'Needs Cleaning'].includes(status)) {
        throw new BadRequestError('Invalid room status', null, { status }, false);
      }

      return await AvailabilityRepository.getAvailableRooms(filters);
    } catch (error) {
      logger.error('Error in getAvailableRooms:', error);
      throw error;
    }
  }

  async getAvailabilitySummary(filters: AvailabilityFilters): Promise<AvailabilitySummaryResponse> {
    try {
      const { start_date, end_date } = filters;

      if (!start_date || !end_date) {
        throw new BadRequestError('Missing required filters: start_date, end_date', null, { start_date, end_date }, false);
      }

      if (parseISO(start_date) >= parseISO(end_date)) {
        throw new BadRequestError('start_date must be before end_date', null, { start_date, end_date }, false);
      }

      return await AvailabilityRepository.getAvailabilitySummary(filters);
    } catch (error) {
      logger.error('Error in getAvailabilitySummary:', error);
      throw error;
    }
  }

  async getRoomDayAvailability(filters: AvailabilityFilters): Promise<RoomDayAvailabilityResponse> {
    try {
      const { room_id, start_date, end_date } = filters;

      if (!room_id || !start_date || !end_date) {
        throw new BadRequestError('Missing required filters: room_id, start_date, end_date', null, { room_id, start_date, end_date }, false);
      }

      if (parseISO(start_date) >= parseISO(end_date)) {
        throw new BadRequestError('start_date must be before end_date', null, { start_date, end_date }, false);
      }

      return await AvailabilityRepository.getRoomDayAvailability(filters);
    } catch (error) {
      logger.error('Error in getRoomDayAvailability:', error);
      throw error;
    }
  }

  async getSingleDateAvailability(filters: AvailabilityFilters): Promise<SingleDateAvailabilityResponse> {
    try {
      const { date } = filters;

      if (!date) {
        throw new BadRequestError('Missing required filter: date', null, { date }, false);
      }

      if (isNaN(parseISO(date).getTime())) {
        throw new BadRequestError('Invalid date format', null, { date }, false);
      }

      return await AvailabilityRepository.getSingleDateAvailability(filters);
    } catch (error) {
      logger.error('Error in getSingleDateAvailability:', error);
      throw error;
    }
  }
}

export default new AvailabilityService();