export interface ReportFilters {
  preset?: string;
  startDate?: string;
  endDate?: string;
  room_type?: string;
  status?: string;
  refunded?: boolean;
  reservationId?: string;
  page?: number;
  limit?: number;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface RevenueBreakdown {
  room_type?: string | {};
  date?: string;
  amount: number;
}

export interface RevenueReportResponse {
  total_revenue: number;
  breakdown: RevenueBreakdown[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentStatusReportResponse {
  success_rate: number;
  payments: Array<{
    reference: string;
    reservationId: string;
    amount: number;
    status: string;
    customerName: string;
    email: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface BookingFinancialsResponse {
  bookings: Array<{
    reservationId: string;
    guest_name: string;
    room_id: string;
    room_type: string;
    revenue: number;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface RefundReportResponse {
  refund_count: number;
  refunded_payments: Array<{
    reference: string;
    reservationId: string;
    amount: number;
    customerName: string;
    email: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface IFinancialReportService {
  getRevenueReport(filters: ReportFilters): Promise<RevenueReportResponse>;

  getPaymentStatusReport(filters: ReportFilters): Promise<PaymentStatusReportResponse>;

  getBookingFinancials(filters: ReportFilters): Promise<BookingFinancialsResponse>;

  getRefundReport(filters: ReportFilters): Promise<RefundReportResponse>;
}