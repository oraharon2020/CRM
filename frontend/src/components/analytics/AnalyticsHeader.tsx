import React from 'react';
import { HiChartBar, HiDownload, HiQuestionMarkCircle, HiLink } from 'react-icons/hi';
import Tooltip from '../Tooltip';

interface AnalyticsHeaderProps {
  activeView: 'dashboard' | 'reports' | 'guide';
  onViewChange: (view: 'dashboard' | 'reports' | 'guide') => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  activeView, 
  onViewChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ניתוח מכירות</h1>
        <p className="text-gray-500">ניתוח מתקדם של נתוני המכירות</p>
      </div>
      
      <div className="flex space-x-2 space-x-reverse">
        <Tooltip content="הצג דשבורד אנליטיקה עם גרפים וסטטיסטיקות">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeView === 'dashboard'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="דשבורד אנליטיקה"
          >
            <HiChartBar className="inline-block ml-1 -mt-1 h-5 w-5" />
            דשבורד
          </button>
        </Tooltip>
        
        <Tooltip content="בנה דוחות מותאמים אישית וייצא אותם">
          <button
            onClick={() => onViewChange('reports')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeView === 'reports'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="דוחות מותאמים אישית"
          >
            <HiDownload className="inline-block ml-1 -mt-1 h-5 w-5" />
            דוחות
          </button>
        </Tooltip>
        
        {/* Integrations button removed - now available as a separate page */}
        
        <Tooltip content="מדריך שימוש והסברים על האנליטיקה">
          <button
            onClick={() => onViewChange('guide')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeView === 'guide'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="מדריך שימוש"
          >
            <HiQuestionMarkCircle className="inline-block ml-1 -mt-1 h-5 w-5" />
            מדריך
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
