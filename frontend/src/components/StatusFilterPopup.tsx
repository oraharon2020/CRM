import React, { useState, useEffect, useRef } from 'react';
import { HiFilter, HiCheck } from 'react-icons/hi';
import { getStatusColor } from '../utils/status-mapping.utils';

interface Status {
  value: string;
  label: string;
  color?: string;
}

interface StatusFilterPopupProps {
  statuses: Status[];
  selectedStatuses: string[];
  onStatusChange: (selectedStatuses: string[]) => void;
  buttonLabel?: string;
  className?: string;
}

const StatusFilterPopup: React.FC<StatusFilterPopupProps> = ({
  statuses,
  selectedStatuses,
  onStatusChange,
  buttonLabel = 'סינון לפי סטטוס',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Toggle a status selection
  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      onStatusChange(selectedStatuses.filter(status => status !== value));
    } else {
      onStatusChange([...selectedStatuses, value]);
    }
  };

  // Select all statuses
  const selectAll = () => {
    onStatusChange(statuses.map(status => status.value).filter(value => value !== 'all'));
  };

  // Clear all selections
  const clearAll = () => {
    onStatusChange([]);
  };

  // Close the popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={popupRef}>
      {/* Filter button */}
      <button
        type="button"
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
          ${selectedStatuses.length > 0 
            ? 'bg-blue-50 text-blue-700 border-blue-300' 
            : 'bg-white text-gray-700'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HiFilter className="ml-2 -mr-1 h-5 w-5" />
        {buttonLabel}
        {selectedStatuses.length > 0 && (
          <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {selectedStatuses.length}
          </span>
        )}
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1 border-b border-gray-200">
            <div className="px-4 py-2 flex justify-between">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={selectAll}
              >
                בחר הכל
              </button>
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-800"
                onClick={clearAll}
              >
                נקה הכל
              </button>
            </div>
          </div>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {statuses
              .filter(status => status.value !== 'all') // Exclude the "All" option
              .map(status => (
                <div
                  key={status.value}
                  className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleStatus(status.value)}
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status.color || getStatusColor(status.label).replace('text-', 'bg-').replace('-800', '-500') || 'bg-gray-200'}`}></span>
                    <span>{status.label}</span>
                  </div>
                  {selectedStatuses.includes(status.value) && (
                    <HiCheck className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              ))}
          </div>
          <div className="py-1 border-t border-gray-200">
            <div className="px-4 py-2 flex justify-between">
              <button
                type="button"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setIsOpen(false)}
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFilterPopup;
