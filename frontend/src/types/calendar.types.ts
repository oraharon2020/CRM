export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
  description: string;
  completed: boolean;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface JewishHoliday {
  id: string;
  title: string;
  date: string;
  hebrew?: string;
  description?: string;
  category?: string;
  isYomTov?: boolean;
}

export type HolidayCategory = 'major' | 'minor' | 'modern' | 'roshchodesh';

export type EventType = 'meeting' | 'task' | 'reminder';
export type PriorityLevel = 'low' | 'medium' | 'high';
