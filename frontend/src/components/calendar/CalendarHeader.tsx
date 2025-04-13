import React from 'react';
import Spinner from '../Spinner';
import { getMonthName } from '../../utils/calendar.utils';
import HolidayFilterPopup from './HolidayFilterPopup';
import { HolidayCategory } from '../../types/calendar.types';

interface CalendarHeaderProps {
  month: number;
  year: number;
  showHolidays: boolean;
  loadingHolidays: boolean;
  selectedCategories: HolidayCategory[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayClick: () => void;
  onToggleHolidays: () => void;
  onCategoryChange: (categories: HolidayCategory[]) => void;
}

/**
 * Calendar header component with month navigation and controls
 */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  showHolidays,
  loadingHolidays,
  selectedCategories,
  onPrevMonth,
  onNextMonth,
  onTodayClick,
  onToggleHolidays,
  onCategoryChange,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {getMonthName(month)} {year}
        </h2>
        <div className="mr-4 flex items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-holidays"
              checked={showHolidays}
              onChange={onToggleHolidays}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="show-holidays" className="mr-2 block text-sm text-gray-700">
              הצג חגים
            </label>
            {loadingHolidays && <Spinner size="sm" className="mr-2" />}
          </div>
          
          {showHolidays && (
            <div className="mr-4">
              <HolidayFilterPopup
                selectedCategories={selectedCategories}
                onCategoryChange={onCategoryChange}
                buttonLabel="סינון חגים"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex space-x-2 space-x-reverse">
        <button
          onClick={onPrevMonth}
          className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          aria-label="חודש קודם"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onTodayClick}
          className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          היום
        </button>
        <button
          onClick={onNextMonth}
          className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          aria-label="חודש הבא"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
