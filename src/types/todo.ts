export type CategoryType = 'none' | 'coral' | 'yellow' | 'green' | 'blue' | 'purple';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'none', label: 'Ingen', color: 'transparent' },
  { id: 'coral', label: 'Korall', color: '#f06450' },
  { id: 'yellow', label: 'Gul', color: '#f5a623' },
  { id: 'green', label: 'Grön', color: '#48bb78' },
  { id: 'blue', label: 'Blå', color: '#4299e1' },
  { id: 'purple', label: 'Lila', color: '#9f7aea' },
];

export type RecurrenceType = 'none' | 'weekly' | 'monthly';

export type AlarmOffset = 'none' | 'at_time' | '5_min' | '15_min' | '30_min' | '1_hour';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeType: 'none' | 'single' | 'interval';
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  category: CategoryType;
  completed: boolean;
  createdAt: number;
  
  // Upprepning (Recurrence)
  recurrence?: RecurrenceType;
  completedDates?: string[]; // ISO dates where a recurring task was completed

  // Larm & Påminnelse (Alarm)
  hasAlarm?: boolean;
  alarmOffset?: AlarmOffset;
  alarmSound?: boolean;
}

export type ViewTab = 'tasks' | 'settings';

export type ScreenState = 'normal' | 'loading' | 'error';
