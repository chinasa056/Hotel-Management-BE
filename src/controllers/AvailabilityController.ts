import { Request, Response } from 'express';
import AvailabilityService from '../services/AvailabilityService';
import { responseHandler } from '../utils/responseHandler';
import {
  AvailabilityFilters,
  AvailabilityResponse,
  AvailabilitySummaryResponse,
  RoomDayAvailabilityResponse,
  SingleDateAvailabilityResponse
} from '../interfaces/availability';

class AvailabilityController {
  private availabilityService: typeof AvailabilityService;

  constructor(availabilityService: typeof AvailabilityService) {
    this.availabilityService = availabilityService;
  }

  async getAvailableRooms(req: Request, res: Response): Promise<void> {
    try {
      const filters: AvailabilityFilters = {
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        room_type: req.query.room_type as string,
        room_id: req.query.room_id as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };
      const response: AvailabilityResponse = await this.availabilityService.getAvailableRooms(filters);

      responseHandler(response, 'Available rooms retrieved successfully');
    } catch (error) {
      console.error('failed to fetch available rooms:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }

  async getAvailabilitySummary(req: Request, res: Response): Promise<void> {
    try {
      const filters: AvailabilityFilters = {
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string
      };
      const response: AvailabilitySummaryResponse = await this.availabilityService.getAvailabilitySummary(filters);

      responseHandler(response, 'Availability summary retrieved successfully');
    } catch (error) {
      console.error('Failed to fetch availability summary:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }

  async getRoomDayAvailability(req: Request, res: Response): Promise<void> {
    try {
      const filters: AvailabilityFilters = {
        room_id: req.query.room_id as string,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string
      };
      const response: RoomDayAvailabilityResponse = await this.availabilityService.getRoomDayAvailability(filters);

      responseHandler(response, 'Room day availability retrieved successfully');
    } catch (error) {
      console.error('Failed to room day availability:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }

  async getSingleDateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const filters: AvailabilityFilters = {
        date: req.query.date as string,
        room_id: req.query.room_id as string
      };
      const response: SingleDateAvailabilityResponse = await this.availabilityService.getSingleDateAvailability(filters);

      responseHandler(response, 'Single date availability retrieved successfully');

    } catch (error) {
       console.error('Failed to fetch date availability summary:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
    }
}

export default new AvailabilityController(AvailabilityService);
