// src/services/templates/pdf/reportTemplates.ts
import { basePdfTemplate } from './baseTemplate';

export const revenueReportHtml = (data: any) => {
  const rows = data.breakdown.map((d: any) => `
    <tr>
      <td>${d.date}</td>
      <td>${d.room_type}</td>
      <td>$${d.revenue.toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2>Revenue Report</h2>
    <p><strong>Period:</strong> ${data.start} to ${data.end}</p>
    <p><strong>Total Revenue:</strong> $${data.total.toFixed(2)}</p>
    <table>
      <thead><tr><th>Date</th><th>Room Type</th><th>Revenue</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  return basePdfTemplate('Revenue Report', content);
};