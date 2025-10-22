import { NextFunction, Request, Response } from 'express';
import PaymentService from '../services/PaymentService';
import { responseHandler } from '../utils/responseHandler';
import { IPaymentService, PaymentInitializationResponse, PaymentVerificationResponse } from '../interfaces/payment';

class PaymentController {
  private paymentService: IPaymentService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
  }

  async initializePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reservationId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        return;
      }

      const result: PaymentInitializationResponse = await this.paymentService.initializePayment(reservationId, userId);
      res.status(201).json(responseHandler(result.data, result.message));
    } catch (error) {
    next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reference } = req.params;
      const result: PaymentVerificationResponse = await this.paymentService.verifyPayment(reference);
      res.status(200).json({message: 'Payment verified successfully', data: result.data});
    } catch (error) {
     next(error);

    }
  }
}

export default new PaymentController(PaymentService);