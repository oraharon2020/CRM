import React, { useState, useEffect, useRef } from 'react';
import { HiFilter, HiCheck } from 'react-icons/hi';
import { HolidayCategory } from '../../types/calendar.types';

interface HolidayFilterPopupProps {
  selectedCategories: HolidayCategory[];
  onCategoryChange: (selectedCategories: HolidayCategory[]) => void;
  buttonLabel?: string;
  className?: string;
}

/**
 * Holiday filter popup component for filtering Jewish holidays by category
 */
const HolidayFilterPopup: React.FC<HolidayFilterPopupProps> = ({
  selectedCategories,
  onCategoryChange,
  buttonLabel = 'סינון חגים',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Category labels and colors
  const categoryOptions: { value: HolidayCategory; label: string; color: string }[] = [
    { value: 'major', label: 'חגים מרכזיים', color: 'bg-purple-100 text-purple-800' },
    { value: 'minor', label: 'חגים משניים', color: 'bg-blue-100 text-blue-800' },
    { value: 'modern', label: 'חגים מודרניים', color: 'bg-green-100 text-green-800' },
    { value: 'roshchodesh', label: 'ראש חודש', color: 'bg-yellow-100 text-yellow-800' },
  ];

  // Toggle a category selection
  const toggleCategory = (value: HolidayCategory) => {
    if (selectedCategories.includes(value)) {
      onCategoryChange(selectedCategories.filter(category => category !== value));
    } else {
      onCategoryChange([...selectedCategories, value]);
    }
  };

  // Select all categories
  const selectAll = () => {
    onCategoryChange(categoryOptions.map(option => option.value));
  };

  // Clear all selections
  const clearAll = () => {
    onCategoryChange([]);
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
          ${selectedCategories.length > 0 && selectedCategories.length < categoryOptions.length
            ? 'bg-purple-50 text-purple-700 border-purple-300' 
            : 'bg-white text-gray-700'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HiFilter className="ml-2 -mr-1 h-5 w-5" />
        {buttonLabel}
        {selectedCategories.length > 0 && selectedCategories.length < categoryOptions.length && (
          <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {selectedCategories.length}
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
            {categoryOptions.map(category => (
              <div
                key={category.value}
                className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleCategory(category.value)}
                role="menuitem"
              >
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${category.color.split(' ')[0]}`}></span>
                  <span>{category.label}</span>
                </div>
                {selectedCategories.includes(category.value) && (
                  <HiCheck className="h-5 w-5 text-purple-600" />
                )}
              </div>
            ))}
          </div>
          <div className="py-1 border-t border-gray-200">
            <div className="px-4 py-2 flex justify-between">
              <button
                type="button"
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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

export default HolidayFilterPopup;
