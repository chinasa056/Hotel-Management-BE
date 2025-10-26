import { startOfDay, subDays, startOfMonth, subMonths, startOfYear } from 'date-fns';

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export function dateRangePresetToDates(preset?: string, start?: string, end?: string): DateRange {
  if (preset === 'custom' && start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid custom start or end date');
    }
    return { startDate, endDate };
  }

  const now = new Date();
  const todayStart = startOfDay(now);

  switch (preset) {
    case 'today':
      return { startDate: todayStart, endDate: now };
    case 'last_7_days':
      return { startDate: subDays(todayStart, 7), endDate: now };
    case 'last_14_days':
      return { startDate: subDays(todayStart, 14), endDate: now };
    case 'month_to_date':
      return { startDate: startOfMonth(todayStart), endDate: now };
    case 'last_3_months':
      return { startDate: subMonths(todayStart, 3), endDate: now };
    case 'last_12_months':
      return { startDate: subMonths(todayStart, 12), endDate: now };
    case 'year_to_date':
      return { startDate: startOfYear(todayStart), endDate: now };
    default:
      return { startDate: undefined, endDate: undefined };
  }
}