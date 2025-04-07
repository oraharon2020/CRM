import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface MonthYearPickerProps {
  month: number; // 1-12
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange
}) => {
  // Month names in Hebrew
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  
  // Handle previous month
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };
  
  // Handle next month
  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };
  
  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value);
    if (!isNaN(newYear) && newYear > 0) {
      onYearChange(newYear);
    }
  };
  
  return (
    <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md">
      {/* Previous month button */}
      <button
        onClick={handlePrevMonth}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="חודש קודם"
      >
        <HiChevronRight className="h-5 w-5" />
      </button>
      
      {/* Month display */}
      <div className="flex-1 text-center">
        <span className="text-sm font-medium text-gray-700">
          {monthNames[month - 1]} {year}
        </span>
      </div>
      
      {/* Next month button */}
      <button
        onClick={handleNextMonth}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="חודש הבא"
      >
        <HiChevronLeft className="h-5 w-5" />
      </button>
      
      {/* Year input */}
      <div className="relative ml-2">
        <input
          type="number"
          value={year}
          onChange={handleYearChange}
          className="w-20 py-1 px-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          aria-label="שנה"
        />
      </div>
    </div>
  );
};

export default MonthYearPicker;
