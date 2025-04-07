import { EventType, PriorityLevel } from '../types/calendar.types';

/**
 * Get the number of days in a month
 * @param month Month (1-12)
 * @param year Year (e.g., 2025)
 * @returns Number of days in the month
 */
export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get the day of week for the first day of a month (0 = Sunday, 6 = Saturday)
 * @param month Month (1-12)
 * @param year Year (e.g., 2025)
 * @returns Day of week (0-6)
 */
export const getFirstDayOfMonth = (month: number, year: number): number => {
  return new Date(year, month - 1, 1).getDay();
};

/**
 * Get the Hebrew month name
 * @param month Month (1-12)
 * @returns Hebrew month name
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return monthNames[month - 1];
};

/**
 * Format a date string to local format (DD/MM/YYYY)
 * @param dateString Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return dateString.split('-').reverse().join('/');
};

/**
 * CSS classes for different event types
 */
export const typeColors: Record<EventType, string> = {
  'meeting': 'bg-purple-100 text-purple-800 border-purple-200',
  'task': 'bg-blue-100 text-blue-800 border-blue-200',
  'reminder': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

/**
 * Hebrew labels for event types
 */
export const typeLabels: Record<EventType, string> = {
  'meeting': 'פגישה',
  'task': 'משימה',
  'reminder': 'תזכורת',
};

/**
 * CSS classes for different priority levels
 */
export const priorityColors: Record<PriorityLevel, string> = {
  'low': 'bg-green-100 text-green-800 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'high': 'bg-red-100 text-red-800 border-red-200',
};

/**
 * Hebrew labels for priority levels
 */
export const priorityLabels: Record<PriorityLevel, string> = {
  'low': 'נמוכה',
  'medium': 'בינונית',
  'high': 'גבוהה',
};

/**
 * Create a date string in ISO format (YYYY-MM-DD)
 * @param year Year
 * @param month Month (1-12)
 * @param day Day of month
 * @returns ISO date string
 */
export const createDateString = (year: number, month: number, day: number): string => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Check if a date is today
 * @param dateString Date string in ISO format (YYYY-MM-DD)
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === new Date().toISOString().split('T')[0];
};
