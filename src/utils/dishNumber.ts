/**
 * Utility to calculate dish card number based on date.
 * Rule: 2026-09-19 is No. 1 ('001'), 2026-09-20 is No. 2 ('002'), etc.
 */
export function getDishNumberByDate(dateStr: string): string {
  if (!dateStr) return '001';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return '001';
  }
  const [year, month, day] = parts;
  // Use UTC to avoid timezone/DST offset errors
  const baseDate = Date.UTC(2026, 8, 19); // Month 8 is September (0-indexed)
  const targetDate = Date.UTC(year, month - 1, day);
  const diffDays = Math.round((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const num = diffDays + 1; // 2026-09-19 gives 0 diff -> 1

  if (num > 0) {
    return String(num).padStart(3, '0');
  }
  return String(num);
}
