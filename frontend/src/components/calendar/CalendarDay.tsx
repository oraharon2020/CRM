import React from 'react';
import { CalendarEvent, JewishHoliday } from '../../types/calendar.types';
import { typeColors, isToday } from '../../utils/calendar.utils';

interface CalendarDayProps {
  day: number;
  date: string;
  isSelected: boolean;
  events: CalendarEvent[];
  holidays: JewishHoliday[];
  onDateClick: (day: number) => void;
}

/**
 * Calendar day cell component
 */
const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  date,
  isSelected,
  events,
  holidays,
  onDateClick,
}) => {
  const todayCheck = isToday(date);
  
  return (
    <div 
      className={`h-24 border border-gray-200 p-1 overflow-hidden ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={() => onDateClick(day)}
    >
      <div className="flex justify-between">
        <span className={`text-sm font-medium ${todayCheck ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
          {day}
        </span>
        {events.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
            {events.length}
          </span>
        )}
      </div>
      
      <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
        {/* Jewish Holidays */}
        {holidays.map(holiday => {
          // Determine color based on holiday category
          let bgColor = 'bg-purple-50';
          let textColor = 'text-purple-700';
          let borderColor = 'border-purple-200';
          let dotColor = 'bg-purple-500';
          
          if (holiday.category === 'major' || holiday.isYomTov) {
            bgColor = 'bg-purple-50';
            textColor = 'text-purple-700';
            borderColor = 'border-purple-200';
            dotColor = 'bg-purple-500';
          } else if (holiday.category === 'minor') {
            bgColor = 'bg-blue-50';
            textColor = 'text-blue-700';
            borderColor = 'border-blue-200';
            dotColor = 'bg-blue-500';
          } else if (holiday.category === 'modern') {
            bgColor = 'bg-green-50';
            textColor = 'text-green-700';
            borderColor = 'border-green-200';
            dotColor = 'bg-green-500';
          } else if (holiday.category === 'roshchodesh') {
            bgColor = 'bg-yellow-50';
            textColor = 'text-yellow-700';
            borderColor = 'border-yellow-200';
            dotColor = 'bg-yellow-500';
          }
          
          return (
            <div 
              key={holiday.id} 
              className={`text-xs truncate px-1 py-0.5 rounded ${bgColor} ${textColor} border ${borderColor} flex items-center`}
              title={holiday.description || holiday.title}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${dotColor} mr-1`}></span>
              {holiday.title}
            </div>
          );
        })}
        
        {/* Events */}
        {events.slice(0, 2).map(event => (
          <div 
            key={event.id} 
            className={`text-xs truncate px-1 py-0.5 rounded ${typeColors[event.type]} ${event.completed ? 'line-through opacity-50' : ''}`}
          >
            {event.time} - {event.title}
          </div>
        ))}
        {events.length > 2 && (
          <div className="text-xs text-gray-500">
            +{events.length - 2} נוספים
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
