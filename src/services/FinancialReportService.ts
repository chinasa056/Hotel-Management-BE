import FinancialReportRepository from '../repositories/FinancialReportRepository';
import {
  ReportFilters,
  RevenueReportResponse,
  PaymentStatusReportResponse,
  BookingFinancialsResponse,
  RefundReportResponse,
  IFinancialReportService
} from '../interfaces/report_analytics';
import { dateRangePresetToDates } from '../utils/dateUtils';
import BadRequestError from '../error/BadRequestError';
import { logger } from '../utils/logger';

class FinancialReportService implements IFinancialReportService {
  async getRevenueReport(filters: ReportFilters): Promise<RevenueReportResponse> {
    try {
      const { preset, startDate, endDate, granularity, room_type } = filters;

      // Validate granularity
      if (granularity && !['daily', 'weekly', 'monthly'].includes(granularity)) {
        throw new BadRequestError('Invalid granularity', null, { granularity }, false);
      }

      // Handle date range
      dateRangePresetToDates(preset, startDate, endDate);
      if ((startDate || endDate) && !startDate && !endDate) {
        throw new BadRequestError('Invalid date range', null, { startDate, endDate }, false);
      }

      const updatedFilters = { ...filters, startDate, endDate };
      return await FinancialReportRepository.getRevenue(updatedFilters);
    } catch (error) {
      logger.error('Error in revenue report service:', error);
      throw error;
    }
  }

  async getPaymentStatusReport(filters: ReportFilters): Promise<PaymentStatusReportResponse> {
    try {
      const { preset, startDate, endDate, status } = filters;

      // Validate status
      if (status && !['Pending', 'Success', 'Failed'].includes(status)) {
        throw new BadRequestError('Invalid payment status', null, { status }, false);
      }

      // Handle date range
       dateRangePresetToDates(preset, startDate, endDate);
      if ((startDate || endDate) && !startDate && !endDate) {
        throw new BadRequestError('Invalid date range', null, { startDate, endDate }, false);
      }

      const updatedFilters = { ...filters, startDate, endDate };
      return await FinancialReportRepository.getPaymentStatus(updatedFilters);
    } catch (error) {
      logger.error('Error in payment status report service:', error);
      throw error;
    }
  }

  async getBookingFinancials(filters: ReportFilters): Promise<BookingFinancialsResponse> {
    try {
      const { preset, startDate, endDate, reservationId } = filters;

      // Handle date range
  dateRangePresetToDates(preset, startDate, endDate);
      if ((startDate || endDate) && !startDate && !endDate) {
        throw new BadRequestError('Invalid date range', null, { startDate, endDate }, false);
      }

      const updatedFilters = { ...filters, startDate, endDate };
      return await FinancialReportRepository.getBookingFinancials(updatedFilters);
    } catch (error) {
      logger.error('Error in booking financials service:', error);
      throw error;
    }
  }

  async getRefundReport(filters: ReportFilters): Promise<RefundReportResponse> {
    try {
      const { preset, startDate, endDate } = filters;

      // Handle date range
 dateRangePresetToDates(preset, startDate, endDate);
      if ((startDate || endDate) && !startDate && !endDate) {
        throw new BadRequestError('Invalid date range', null, { startDate, endDate }, false);
      }

      const updatedFilters = { ...filters, startDate, endDate };
      return await FinancialReportRepository.getRefundReport(updatedFilters);
    } catch (error) {
      logger.error('Error in refund report service:', error);
      throw error;
    }
  }
}

export default new FinancialReportService();
