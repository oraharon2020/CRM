import React from 'react';
import { JewishHoliday, HolidayCategory } from '../../types/calendar.types';
import { formatDate } from '../../utils/calendar.utils';

interface HolidayDetailsProps {
  holidays: JewishHoliday[];
  selectedDate: string | null;
}

/**
 * Holiday details component for displaying holiday information for a selected date
 */
const HolidayDetails: React.FC<HolidayDetailsProps> = ({
  holidays,
  selectedDate,
}) => {
  if (!selectedDate || holidays.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">חגים בתאריך {formatDate(selectedDate)}</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {holidays.map(holiday => {
            // Determine color based on holiday category
            let bgColor = 'bg-purple-50';
            let textColor = 'text-purple-700';
            let borderColor = 'border-purple-200';
            let headingColor = 'text-purple-800';
            let hebrewColor = 'text-purple-600';
            
            if (holiday.category === 'major' || holiday.isYomTov) {
              bgColor = 'bg-purple-50';
              textColor = 'text-purple-700';
              borderColor = 'border-purple-200';
              headingColor = 'text-purple-800';
              hebrewColor = 'text-purple-600';
            } else if (holiday.category === 'minor') {
              bgColor = 'bg-blue-50';
              textColor = 'text-blue-700';
              borderColor = 'border-blue-200';
              headingColor = 'text-blue-800';
              hebrewColor = 'text-blue-600';
            } else if (holiday.category === 'modern') {
              bgColor = 'bg-green-50';
              textColor = 'text-green-700';
              borderColor = 'border-green-200';
              headingColor = 'text-green-800';
              hebrewColor = 'text-green-600';
            } else if (holiday.category === 'roshchodesh') {
              bgColor = 'bg-yellow-50';
              textColor = 'text-yellow-700';
              borderColor = 'border-yellow-200';
              headingColor = 'text-yellow-800';
              hebrewColor = 'text-yellow-600';
            }
            
            // Get category label
            let categoryLabel = '';
            if (holiday.category === 'major' || holiday.isYomTov) {
              categoryLabel = 'חג מרכזי';
            } else if (holiday.category === 'minor') {
              categoryLabel = 'חג משני';
            } else if (holiday.category === 'modern') {
              categoryLabel = 'חג מודרני';
            } else if (holiday.category === 'roshchodesh') {
              categoryLabel = 'ראש חודש';
            }
            
            return (
              <div key={holiday.id} className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}>
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium ${headingColor}`}>{holiday.title}</h3>
                  {holiday.hebrew && (
                    <span className={`text-sm ${hebrewColor}`}>{holiday.hebrew}</span>
                  )}
                </div>
                
                {categoryLabel && (
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${bgColor} ${textColor}`}>
                      {categoryLabel}
                    </span>
                  </div>
                )}
                
                {holiday.description && (
                  <p className="mt-2 text-sm text-gray-600">{holiday.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HolidayDetails;
