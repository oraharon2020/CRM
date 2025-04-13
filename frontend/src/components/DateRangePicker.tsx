import React, { useState, useEffect } from 'react';
import { HiCalendar } from 'react-icons/hi';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  isOpen: externalIsOpen,
  onToggle
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(externalIsOpen || false);
  const [localStartDate, setLocalStartDate] = useState<string>(
    startDate ? formatDateForInput(startDate) : ''
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    endDate ? formatDateForInput(endDate) : ''
  );
  
  // Update local dates when props change
  useEffect(() => {
    if (startDate) {
      setLocalStartDate(formatDateForInput(startDate));
    }
    if (endDate) {
      setLocalEndDate(formatDateForInput(endDate));
    }
  }, [startDate, endDate]);

  // Update isOpen state when external isOpen changes
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Format date to YYYY-MM-DD for input fields
  function formatDateForInput(date: Date): string {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  }

  // Format date for display (DD/MM/YYYY)
  function formatDateForDisplay(dateString: string | null): string {
    if (!dateString) return '';
    
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error('Error formatting date for display:', e);
      return '';
    }
  }

  // Create a date object with proper timezone handling
  function createDateFromString(dateString: string): Date | null {
    try {
      if (!dateString) return null;
      
      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Create a new date with the local timezone
      // Important: month - 1 because JavaScript months are 0-indexed (0-11)
      const date = new Date(year, month - 1, day);
      
      // Ensure the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date created:', dateString);
        return null;
      }
      
      // Set the time to noon to avoid timezone issues
      date.setHours(12, 0, 0, 0);
      
      // Log the created date for debugging
      console.log(`Created date from string ${dateString}: ${date.toISOString()}`);
      
      return date;
    } catch (e) {
      console.error('Error creating date from string:', e, dateString);
      return null;
    }
  }

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDateStr = e.target.value;
    setLocalStartDate(newStartDateStr);
    
    const newStartDate = createDateFromString(newStartDateStr);
    onDateChange(newStartDate, endDate);
  };

  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDateStr = e.target.value;
    setLocalEndDate(newEndDateStr);
    
    const newEndDate = createDateFromString(newEndDateStr);
    onDateChange(startDate, newEndDate);
  };

  // Apply button handler
  const handleApply = () => {
    // Make sure we have valid dates
    if (localStartDate && localEndDate) {
      const newStartDate = createDateFromString(localStartDate);
      const newEndDate = createDateFromString(localEndDate);
      
      console.log('Applying date range:', newStartDate, newEndDate);
      onDateChange(newStartDate, newEndDate);
    }
    
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(false);
    }
  };

  // Get display text
  const getDisplayText = (): string => {
    if (startDate && endDate) {
      return `${formatDateForDisplay(localStartDate)} - ${formatDateForDisplay(localEndDate)}`;
    }
    return 'בחר טווח תאריכים';
  };

  // Toggle the date picker
  const toggleDatePicker = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex justify-between items-center w-48 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={toggleDatePicker}
      >
        <span>{getDisplayText()}</span>
        <HiCalendar className="mr-2 h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute left-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                מתאריך
              </label>
              <input
                type="date"
                id="start-date"
                name="start-date"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={localStartDate}
                onChange={handleStartDateChange}
                max={localEndDate || undefined}
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                עד תאריך
              </label>
              <input
                type="date"
                id="end-date"
                name="end-date"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={localEndDate}
                onChange={handleEndDateChange}
                min={localStartDate || undefined}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                onClick={handleApply}
              >
                החל
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
