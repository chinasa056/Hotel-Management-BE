import { Request, Response } from 'express';
import FinancialReportService from '../services/FinancialReportService';
import { responseHandler } from '../utils/responseHandler';
import {
  ReportFilters,
  RevenueReportResponse,
  PaymentStatusReportResponse,
  BookingFinancialsResponse,
  RefundReportResponse
} from '../interfaces/report_analytics';

class FinancialReportController {
  private financialReportService: typeof FinancialReportService;

  constructor(financialReportService: typeof FinancialReportService) {
    this.financialReportService = financialReportService;
  }

  async getRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: ReportFilters = {
        preset: req.query.preset as string,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        room_type: req.query.room_type as string,
        granularity: req.query.granularity as 'daily' | 'weekly' | 'monthly',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const report: RevenueReportResponse = await this.financialReportService.getRevenueReport(filters);

      responseHandler(report, 'Revenue report retrieved successfully');

    } catch (error) {
      console.error('Error in getRevenueReport controller:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }

  async getPaymentStatusReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: ReportFilters = {
        preset: req.query.preset as string,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const report: PaymentStatusReportResponse = await this.financialReportService.getPaymentStatusReport(filters);

      responseHandler(report, 'Payment status report retrieved successfully');

    } catch (error) {
      console.error('Error fetching payment status report:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }

  async getBookingFinancials(req: Request, res: Response): Promise<void> {
    try {
      const filters: ReportFilters = {
        preset: req.query.preset as string,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        reservationId: req.query.reservationId as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const report: BookingFinancialsResponse = await this.financialReportService.getBookingFinancials(filters);

      responseHandler(report, 'Booking financials retrieved successfully');

    } catch (error) {
      console.error('Error fetching booking financial report:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }

  async getRefundReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: ReportFilters = {
        preset: req.query.preset as string,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const report: RefundReportResponse = await this.financialReportService.getRefundReport(filters);

      responseHandler(report, 'Refund report retrieved successfully');
      
    } catch (error) {
      console.error('Error fetching refund report:', error);
      res.status((error as any).httpCode || 400).json({
        status: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue report',
        data: null
      });
    }
  }
}

export default new FinancialReportController(FinancialReportService);
