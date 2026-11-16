export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed: 8 = September
  name: string; // "September 2026"
  days: {
    dateStr: string; // 'YYYY-MM-DD'
    dayNumber: number;
    isCurrentMonth: boolean;
    dayOfWeek: number; // 0 = Sun, 6 = Sat
  }[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function generateMonthData(year: number, month: number): CalendarMonth {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 for Sun
  const totalDays = lastDay.getDate();

  const days: CalendarMonth['days'] = [];

  // Pad previous month days as empty / placeholders if needed, or nulls
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({
      dateStr: '',
      dayNumber: 0,
      isCurrentMonth: false,
      dayOfWeek: i,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const dayOfWeek = new Date(year, month, d).getDay();

    days.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      dayOfWeek,
    });
  }

  return {
    year,
    month,
    name: `${MONTH_NAMES[month]} ${year}`,
    days,
  };
}

export function formatShortDateBadge(dateStr: string): { day: number; month: string } {
  if (!dateStr) return { day: 1, month: 'Sep' };
  const parts = dateStr.split('-');
  const day = parseInt(parts[2], 10) || 1;
  const monthIdx = (parseInt(parts[1], 10) || 9) - 1;
  return {
    day,
    month: MONTH_SHORT_NAMES[monthIdx] || 'Sep',
  };
}
