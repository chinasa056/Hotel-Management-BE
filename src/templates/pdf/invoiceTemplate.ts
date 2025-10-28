
import { basePdfTemplate } from './baseTemplate';

export const invoiceHtmlTemplate = (
  reservation: any,
  payment: any,
  room: any
) => {
  const content = `
    <h2>Invoice</h2>
    <p><strong>Reservation ID:</strong> ${reservation.id}</p>
    <p><strong>Guest:</strong> ${payment.customerName} (${payment.email})</p>
    <p><strong>Room:</strong> ${room.room_type} (#${room.id})</p>
    <p><strong>Check-in:</strong> ${new Date(reservation.check_in_date).toLocaleDateString()}</p>
    <p><strong>Check-out:</strong> ${new Date(reservation.check_out_date).toLocaleDateString()}</p>
    <p><strong>Amount Paid:</strong> $${(payment.amount / 100).toFixed(2)}</p>
    <p><strong>Status:</strong> ${payment.status}</p>
    <p><strong>Reference:</strong> ${payment.reference}</p>
  `;

  return basePdfTemplate('Hotel Invoice', content);
};