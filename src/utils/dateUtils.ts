const SWEDISH_MONTHS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december'
];

const SWEDISH_WEEKDAYS_SHORT = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
const SWEDISH_WEEKDAYS_FULL = [
  'Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'
];

// ISO date string: YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateISO(isoString: string): Date {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format as "Måndag 22 oktober 2026"
export function formatFullSwedishDate(isoString: string): string {
  const date = parseDateISO(isoString);
  const weekday = SWEDISH_WEEKDAYS_FULL[date.getDay()];
  const day = date.getDate();
  const month = SWEDISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

// Format as "Ons 22 oktober 2026"
export function formatModalSwedishDate(isoString: string): string {
  const date = parseDateISO(isoString);
  const weekday = SWEDISH_WEEKDAYS_SHORT[date.getDay()];
  const day = date.getDate();
  const month = SWEDISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

export interface WeekDayItem {
  iso: string;
  weekdayShort: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentSelected: boolean;
}

// Generate the 7 days (Monday to Sunday) for the week containing `targetDateIso`
// Using 2026-10-22 as the reference "today" date to match the user's screenshots
export const REFERENCE_TODAY_ISO = '2026-10-22';

export function getWeekDaysForDate(targetDateIso: string, referenceTodayIso: string = REFERENCE_TODAY_ISO): WeekDayItem[] {
  const targetDate = parseDateISO(targetDateIso);
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Calculate distance to Monday (in Sweden weeks start on Monday)
  // If Sunday (0), distance is 6 days back. Otherwise dayOfWeek - 1.
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(targetDate);
  monday.setDate(targetDate.getDate() - distanceToMonday);

  const days: WeekDayItem[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const iso = formatDateISO(current);
    
    // Day short name (Mon, Tue, etc.)
    const weekdayShort = SWEDISH_WEEKDAYS_SHORT[current.getDay()];

    days.push({
      iso,
      weekdayShort,
      dayNumber: current.getDate(),
      isToday: iso === referenceTodayIso,
      isCurrentSelected: iso === targetDateIso,
    });
  }

  return days;
}

// Check if a time range string is valid (start before end)
export function validateTimeRange(start: string, end: string): boolean {
  if (!start || !end) return true;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return true;

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  return endTotal > startTotal;
}

// Check if a task is scheduled for targetDateIso based on its anchor date and recurrence rule
export function isTaskScheduledForDate(
  taskDateIso: string,
  targetDateIso: string,
  recurrence?: 'none' | 'weekly' | 'monthly'
): boolean {
  if (!recurrence || recurrence === 'none') {
    return taskDateIso === targetDateIso;
  }

  // Recurring tasks do not appear before their anchor creation date
  if (targetDateIso < taskDateIso) {
    return false;
  }

  const taskDate = parseDateISO(taskDateIso);
  const targetDate = parseDateISO(targetDateIso);

  if (recurrence === 'weekly') {
    // Same day of week (e.g. both Thursdays)
    return taskDate.getDay() === targetDate.getDay();
  }

  if (recurrence === 'monthly') {
    // Same day of month (e.g. 22nd)
    return taskDate.getDate() === targetDate.getDate();
  }

  return false;
}

// Get Swedish recurrence text label
export function getRecurrenceLabel(recurrence?: 'none' | 'weekly' | 'monthly'): string {
  switch (recurrence) {
    case 'weekly':
      return 'Varje vecka';
    case 'monthly':
      return 'Varje månad';
    default:
      return 'Aldrig';
  }
}

// Get Swedish alarm offset label
export function getAlarmOffsetLabel(offset?: string): string {
  switch (offset) {
    case 'at_time':
      return 'Vid starttid';
    case '5_min':
      return '5 min innan';
    case '15_min':
      return '15 min innan';
    case '30_min':
      return '30 min innan';
    case '1_hour':
      return '1 timme innan';
    default:
      return 'Inget larm';
  }
}

