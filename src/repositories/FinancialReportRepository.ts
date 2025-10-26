import { Payment } from '../models/PaymentModel';
import SupabaseClientService from '../services/SupabaseClientService';
import { ReportFilters, RevenueReportResponse, PaymentStatusReportResponse, BookingFinancialsResponse, RefundReportResponse, RevenueBreakdown } from '../interfaces/report_analytics';
import { logger } from '../utils/logger';
import InternalServerError from '../error/InternalServerError';
// import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

class FinancialReportRepository {
  async getRevenue(filters: ReportFilters): Promise<RevenueReportResponse> {
    try {
      const { room_type, status = 'Success', page = 1, limit = 10, granularity } = filters;
      const { startDate, endDate } = filters;

      const query: any = { status };
      if (startDate && endDate) {
        query.updatedAt = { $gte: startDate, $lte: endDate };
      }
      if (room_type) {
        const rooms = await SupabaseClientService.selectFromTable('rooms', { room_type }, 'id');
        const roomIds = rooms.map((room: any) => room.id);
        const reservations = await SupabaseClientService.selectFromTable('reservations', { room_id: roomIds }, 'id');
        query.reservationId = { $in: reservations.map((res: any) => res.id) };
      }

      const payments = await Payment.find(query);
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount / 100, 0);

      let breakdown: RevenueBreakdown[] = [];
      if (granularity) {
        const groupBy: any = {};
        if (granularity === 'daily') groupBy._id = { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } };
        if (granularity === 'weekly') groupBy._id = { $dateToString: { format: '%Y-%U', date: '$updatedAt' } };
        if (granularity === 'monthly') groupBy._id = { $dateToString: { format: '%Y-%m', date: '$updatedAt' } };

        const aggregated = await Payment.aggregate([
          { $match: query },
          { $group: { _id: groupBy._id, amount: { $sum: { $divide: ['$amount', 100] } } },
          { $sort: { _id: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]);
        breakdown = aggregated.map(item => ({ date: item._id, amount: item.amount }));

      } else if (room_type) {
        const reservations = await SupabaseClientService.selectFromTable('reservations', { id: payments.map(p => p.reservationId) }, 'id, room_id');
        const roomIds = [...new Set(reservations.map((res: any) => res.room_id))];
        const rooms = await SupabaseClientService.selectFromTable('rooms', { id: roomIds }, 'id, room_type');
        const roomTypeMap = new Map(rooms.map((room: any) => [room.id, room.room_type]));
        breakdown = payments.reduce((acc: RevenueBreakdown[], payment) => {
          const reservation = reservations.find((res: any) => res.id === payment.reservationId);
          if (reservation) {
            const roomType = roomTypeMap.get(reservation.room_id);
            if (roomType) {
              const existing = acc.find(item => item.room_type === roomType);
              if (existing) existing.amount += payment.amount / 100;
              else acc.push({ room_type: roomType, amount: payment.amount / 100 });
            }
          }
          return acc;
        }, []);
      }

      const total = breakdown.length || payments.length;
      return { total_revenue: totalRevenue, breakdown, total, page, limit };
    } catch (error) {
      logger.error('Error fetching revenue report:', error);
      throw new InternalServerError('Failed to fetch revenue report', error instanceof Error ? error : new Error('Revenue fetch failed'), { filters }, false);
    }
  }

  async getPaymentStatus(filters: ReportFilters): Promise<PaymentStatusReportResponse> {
    try {
      const { status, page = 1, limit = 10 } = filters;
      const { startDate, endDate } = filters;

      const query: any = {};
      if (status) query.status = status;
      if (startDate && endDate) query.updatedAt = { $gte: startDate, $lte: endDate };

      const totalPayments = await Payment.countDocuments(query);
      const successPayments = await Payment.countDocuments({ ...query, status: 'Success' });
      const successRate = totalPayments ? (successPayments / totalPayments) * 100 : 0;

      const payments = await Payment.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('reference reservationId amount status customerName email');

      return {
        success_rate: successRate,
        payments: payments.map(p => ({
          reference: p.reference,
          reservationId: p.reservationId,
          amount: p.amount / 100,
          status: p.status,
          customerName: p.customerName,
          email: p.email,
        })),
        total: totalPayments,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching payment status report:', error);
      throw new InternalServerError('Failed to fetch payment status report', error instanceof Error ? error : new Error('Payment status fetch failed'), { filters }, false);
    }
  }

  async getBookingFinancials(filters: ReportFilters): Promise<BookingFinancialsResponse> {
    try {
      const { reservationId, page = 1, limit = 10 } = filters;
      const { startDate, endDate } = filters;

      const paymentQuery: any = { status: 'Success' };
      if (startDate && endDate) paymentQuery.updatedAt = { $gte: startDate, $lte: endDate };
      if (reservationId) paymentQuery.reservationId = reservationId;

      const payments = await Payment.find(paymentQuery);
      const reservationIds = [...new Set(payments.map(p => p.reservationId))];

      const reservations = await SupabaseClientService.selectFromTable(
        'reservations',
        { id: reservationIds },
        'id, guest_name, room_id, check_in_date, check_out_date, status'
      );
      const roomIds = [...new Set(reservations.map((res: any) => res.room_id))];
      const rooms = await SupabaseClientService.selectFromTable('rooms', { id: roomIds }, 'id, room_type');

      const roomTypeMap = new Map(rooms.map((room: any) => [room.id, room.room_type]));
      const bookings = reservations.map((res: any) => {
        const payment = payments.find(p => p.reservationId === res.id);
        return {
          reservationId: res.id,
          guest_name: res.guest_name,
          room_id: res.room_id,
          room_type: roomTypeMap.get(res.room_id) || 'Unknown',
          revenue: payment ? payment.amount / 100 : 0,
        };
      }).filter((b: { revenue: number; }) => b.revenue > 0);
    //   .filter(b => b.revenue > 0);

      const total = bookings.length;
      return {
        bookings: bookings.slice((page - 1) * limit, page * limit),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching booking financials:', error);
      throw new InternalServerError('Failed to fetch booking financials', error instanceof Error ? error : new Error('Booking financials fetch failed'), { filters }, false);
    }
  }

  async getRefundReport(filters: ReportFilters): Promise<RefundReportResponse> {
    try {
      const { page = 1, limit = 10 } = filters;
      const { startDate, endDate } = filters;

      const query: any = { refunded: true };
      if (startDate && endDate) query.updatedAt = { $gte: startDate, $lte: endDate };

      const refundCount = await Payment.countDocuments(query);
      const payments = await Payment.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('reference reservationId amount customerName email');

      return {
        refund_count: refundCount,
        refunded_payments: payments.map(p => ({
          reference: p.reference,
          reservationId: p.reservationId,
          amount: p.amount / 100,
          customerName: p.customerName,
          email: p.email,
        })),
        total: refundCount,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching refund report:', error);
      throw new InternalServerError('Failed to fetch refund report', error instanceof Error ? error : new Error('Refund report fetch failed'), { filters }, false);
    }
  }
}

export default new FinancialReportRepository();