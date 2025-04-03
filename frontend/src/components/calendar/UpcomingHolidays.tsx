import React from 'react';
import { JewishHoliday, HolidayCategory } from '../../types/calendar.types';
import { formatDate } from '../../utils/calendar.utils';

interface UpcomingHolidaysProps {
  holidays: JewishHoliday[];
  limit?: number;
}

/**
 * Upcoming holidays component for displaying upcoming Jewish holidays
 */
const UpcomingHolidays: React.FC<UpcomingHolidaysProps> = ({
  holidays,
  limit = 3,
}) => {
  if (holidays.length === 0) {
    return null;
  }

  // Filter and sort upcoming holidays
  const upcomingHolidays = holidays
    .filter(holiday => new Date(holiday.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  if (upcomingHolidays.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">חגים קרובים</h2>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {upcomingHolidays.map(holiday => {
            // Determine color based on holiday category
            let bgColor = 'bg-purple-50';
            let textColor = 'text-purple-700';
            let borderColor = 'border-purple-200';
            
            if (holiday.category === 'major' || holiday.isYomTov) {
              bgColor = 'bg-purple-50';
              textColor = 'text-purple-700';
              borderColor = 'border-purple-200';
            } else if (holiday.category === 'minor') {
              bgColor = 'bg-blue-50';
              textColor = 'text-blue-700';
              borderColor = 'border-blue-200';
            } else if (holiday.category === 'modern') {
              bgColor = 'bg-green-50';
              textColor = 'text-green-700';
              borderColor = 'border-green-200';
            } else if (holiday.category === 'roshchodesh') {
              bgColor = 'bg-yellow-50';
              textColor = 'text-yellow-700';
              borderColor = 'border-yellow-200';
            }
            
            return (
              <div 
                key={holiday.id}
                className={`flex items-center ${bgColor} ${textColor} border ${borderColor} rounded-full px-3 py-1`}
                title={holiday.description || holiday.title}
              >
                <span className="font-medium">{holiday.title}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(holiday.date)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpcomingHolidays;
