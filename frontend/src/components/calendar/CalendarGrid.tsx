import React from 'react';
import { CalendarEvent, JewishHoliday } from '../../types/calendar.types';
import { getDaysInMonth, getFirstDayOfMonth, createDateString } from '../../utils/calendar.utils';
import CalendarDay from './CalendarDay';

interface CalendarGridProps {
  month: number;
  year: number;
  selectedDate: string | null;
  events: CalendarEvent[];
  holidays: JewishHoliday[];
  showHolidays: boolean;
  onDateClick: (day: number) => void;
}

/**
 * Calendar grid component that displays days of the month
 */
const CalendarGrid: React.FC<CalendarGridProps> = ({
  month,
  year,
  selectedDate,
  events,
  holidays,
  showHolidays,
  onDateClick,
}) => {
  // Generate calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    
    // Adjust for week starting on Sunday (0) in JavaScript
    // but we want to display week starting on Monday (1)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = createDateString(year, month, day);
      const isSelected = date === selectedDate;
      const eventsForDay = events.filter(event => event.date === date);
      const holidaysForDay = showHolidays ? holidays.filter(holiday => holiday.date === date) : [];
      
      days.push(
        <CalendarDay
          key={day}
          day={day}
          date={date}
          isSelected={isSelected}
          events={eventsForDay}
          holidays={holidaysForDay}
          onDateClick={onDateClick}
        />
      );
    }
    
    return days;
  };

  return (
    <div>
      {/* Days of week */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b border-gray-200">
        <div className="py-2">שני</div>
        <div className="py-2">שלישי</div>
        <div className="py-2">רביעי</div>
        <div className="py-2">חמישי</div>
        <div className="py-2">שישי</div>
        <div className="py-2">שבת</div>
        <div className="py-2">ראשון</div>
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CalendarGrid;
