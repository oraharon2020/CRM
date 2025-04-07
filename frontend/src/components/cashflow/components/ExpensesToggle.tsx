import React from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface ExpensesToggleProps {
  showExpenses: boolean;
  onToggle: () => void;
}

const ExpensesToggle: React.FC<ExpensesToggleProps> = ({ showExpenses, onToggle }) => {
  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <button
        onClick={onToggle}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        {showExpenses ? (
          <>
            <HiChevronUp className="ml-1 h-5 w-5" />
            הסתר עמודות הוצאות
          </>
        ) : (
          <>
            <HiChevronDown className="ml-1 h-5 w-5" />
            הצג עמודות הוצאות
          </>
        )}
      </button>
    </div>
  );
};

export default ExpensesToggle;
