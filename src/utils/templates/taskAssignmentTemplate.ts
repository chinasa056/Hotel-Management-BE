import { format } from 'date-fns';

export const taskAssignmentTemplate = ({
  staffName,
  roomId,
  taskType,
  dueDate,
  hotelName,
  logoUrl,
}: {
  staffName: string;
  roomId: string;
  taskType: string;
  dueDate: Date;
  hotelName: string;
  logoUrl: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <img src="${logoUrl}" alt="${hotelName} Logo" style="width: 150px; display: block; margin: 0 auto;">
    <h2>Task Assignment - ${hotelName}</h2>
    <p>Dear ${staffName},</p>
    <p>You have been assigned a <strong>${taskType}</strong> task for <strong>Room ${roomId}</strong>, due by <strong>${format(dueDate, 'PPPPp')}</strong>.</p>
    <p>Please contact the housekeeping manager for any details or questions.</p>
    <p>Best regards,<br>${hotelName}</p>
  </div>
`;