import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from: Date; to: Date };
  onSelect?: (date: Date | { from: Date; to: Date } | undefined) => void;
  className?: string;
  initialFocus?: boolean;
  defaultMonth?: Date;
  numberOfMonths?: number;
}

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  className = '',
  initialFocus = false,
  defaultMonth = new Date(),
  numberOfMonths = 1,
}) => {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);
  const [focusedDate, setFocusedDate] = useState<Date | null>(initialFocus ? defaultMonth : null);
  const [rangeStart, setRangeStart] = useState<Date | null>(
    mode === 'range' && selected && 'from' in selected ? selected.from : null
  );

  const handleDateSelect = (date: Date) => {
    if (mode === 'single') {
      onSelect?.(date);
    } else if (mode === 'range') {
      if (!rangeStart) {
        setRangeStart(date);
        onSelect?.({ from: date, to: date });
      } else {
        // If the selected date is before the range start, swap them
        if (date < rangeStart) {
          onSelect?.({ from: date, to: rangeStart });
        } else {
          onSelect?.({ from: rangeStart, to: date });
        }
        setRangeStart(null);
      }
    }
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === 'single') {
      return selected instanceof Date && isSameDay(date, selected);
    } else if (mode === 'range' && selected && 'from' in selected && 'to' in selected) {
      return (
        isSameDay(date, selected.from) ||
        isSameDay(date, selected.to) ||
        (date > selected.from && date < selected.to)
      );
    }
    return false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (mode === 'range' && selected && 'from' in selected && 'to' in selected) {
      return date > selected.from && date < selected.to;
    }
    return false;
  };

  const isRangeStart = (date: Date): boolean => {
    if (mode === 'range' && selected && 'from' in selected) {
      return isSameDay(date, selected.from);
    }
    return false;
  };

  const isRangeEnd = (date: Date): boolean => {
    if (mode === 'range' && selected && 'to' in selected) {
      return isSameDay(date, selected.to);
    }
    return false;
  };

  const renderMonthGrid = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a 6x7 grid for the calendar
    const calendarGrid: Date[][] = [];
    let currentWeek: Date[] = [];

    // Add days from previous month to fill the first week
    const firstDayOfMonth = monthStart.getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(addDays(monthStart, i - firstDayOfMonth));
    }

    // Add days of the current month
    daysInMonth.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        calendarGrid.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add days from next month to fill the last week
    if (currentWeek.length > 0) {
      const daysToAdd = 7 - currentWeek.length;
      for (let i = 1; i <= daysToAdd; i++) {
        currentWeek.push(addDays(monthEnd, i));
      }
      calendarGrid.push(currentWeek);
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {format(monthDate, 'MMMM yyyy', { locale: he })}
          </h2>
          {numberOfMonths === 1 && (
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {calendarGrid.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const isSelected = isDateSelected(day);
              const isInRange = isDateInRange(day);
              const isStart = isRangeStart(day);
              const isEnd = isRangeEnd(day);
              const isFocused = focusedDate ? isSameDay(day, focusedDate) : false;
              const isCurrentMonth = isSameMonth(day, monthDate);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  onFocus={() => setFocusedDate(day)}
                  onBlur={() => setFocusedDate(null)}
                  className={`
                    h-9 w-9 rounded-md text-center text-sm
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${isCurrentDay ? 'border border-blue-500' : ''}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
                    ${isInRange ? 'bg-blue-100' : ''}
                    ${isStart ? 'rounded-l-md' : ''}
                    ${isEnd ? 'rounded-r-md' : ''}
                    ${isFocused ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`p-3 bg-white ${className}`}>
      <div className={`grid ${numberOfMonths > 1 ? 'grid-cols-2 gap-4' : ''}`}>
        {renderMonthGrid(currentMonth)}
        {numberOfMonths > 1 && renderMonthGrid(addMonths(currentMonth, 1))}
      </div>
    </div>
  );
};
