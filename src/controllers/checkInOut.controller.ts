import { Request, Response } from 'express';
import CheckInOutService from '../services/CheckInOutService';
import { responseHandler } from '../utils/responseHandler';
import { CheckInOptions, CheckOutOptions } from '../interfaces/checkInOut';

class CheckInOutController {
  private checkInOutService: typeof CheckInOutService;

  constructor(checkInOutService:  typeof CheckInOutService) {
    this.checkInOutService = checkInOutService;
  }

  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const options: CheckInOptions = { reservationId };
      await this.checkInOutService.checkIn(options);
      res.status(200).json('Check-in successful');
    } catch (error) {
      res.status(400).json(error instanceof Error ? error.message : 'Failed to check in');
    }
  }

  async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const options: CheckOutOptions = { reservationId };
      await this.checkInOutService.checkOut(options);
      res.status(200).json('Check-out successful');
    } catch (error) {
      res.status(400).json(error instanceof Error ? error.message : 'Failed to check out');
    }
  }
}

export default new CheckInOutController(CheckInOutService);