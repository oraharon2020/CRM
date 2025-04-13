import React from 'react';
import { HiRefresh, HiCog, HiInformationCircle, HiDatabase } from 'react-icons/hi';
import Spinner from '../Spinner';
import StoreSelector from '../StoreSelector';
import DateRangePicker from '../DateRangePicker';
import Tooltip from '../Tooltip';

interface AnalyticsFiltersProps {
  selectedStoreId: number | null;
  onStoreChange: (storeId: number | null) => void;
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'year' | 'custom') => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  groupBy: 'day' | 'week' | 'month';
  onGroupByChange: (groupBy: 'day' | 'week' | 'month') => void;
  activeView: 'dashboard' | 'reports' | 'guide' | 'integrations';
  loading: boolean;
  onRefresh: () => void;
  onOpenStatusModal: () => void;
  onSyncCache?: () => void;
  isSyncing?: boolean;
  isAdmin?: boolean;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  selectedStoreId,
  onStoreChange,
  period,
  onPeriodChange,
  startDate,
  endDate,
  onDateRangeChange,
  groupBy,
  onGroupByChange,
  activeView,
  loading,
  onRefresh,
  onOpenStatusModal,
  onSyncCache,
  isSyncing = false,
  isAdmin = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* Store Selection */}
        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
          <div className="w-full sm:w-1/4">
            <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
              חנות
              <Tooltip content="בחר חנות כדי להציג את נתוני האנליטיקה שלה">
                <HiInformationCircle className="inline-block mr-1 text-gray-400 h-4 w-4" />
              </Tooltip>
            </label>
            <div className="flex items-center">
              <StoreSelector 
                selectedStoreId={selectedStoreId} 
                onStoreChange={onStoreChange} 
              />
              
              {selectedStoreId && (
                <Tooltip content="הגדרות סטטוס - בחר אילו סטטוסים לכלול בניתוח">
                  <button
                    onClick={onOpenStatusModal}
                    className="p-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                    aria-label="הגדרות סטטוס"
                  >
                    <HiCog className="w-5 h-5" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
          
          {/* Period Selection */}
          <div className="w-full sm:w-1/3">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
              תקופה
              <Tooltip content="בחר את טווח הזמן להצגת הנתונים">
                <HiInformationCircle className="inline-block mr-1 text-gray-400 h-4 w-4" />
              </Tooltip>
            </label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <Tooltip content="נתוני היום הנוכחי">
                <button
                  onClick={() => onPeriodChange('today')}
                  className={`px-3 py-1 text-sm transition-colors duration-200 ${
                    period === 'today'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="היום"
                >
                  היום
                </button>
              </Tooltip>
              <Tooltip content="נתוני 7 הימים האחרונים">
                <button
                  onClick={() => onPeriodChange('week')}
                  className={`px-3 py-1 text-sm transition-colors duration-200 ${
                    period === 'week'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="שבוע"
                >
                  שבוע
                </button>
              </Tooltip>
              <Tooltip content="נתוני 30 הימים האחרונים">
                <button
                  onClick={() => onPeriodChange('month')}
                  className={`px-3 py-1 text-sm transition-colors duration-200 ${
                    period === 'month'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="חודש"
                >
                  חודש
                </button>
              </Tooltip>
              <Tooltip content="נתוני השנה האחרונה">
                <button
                  onClick={() => onPeriodChange('year')}
                  className={`px-3 py-1 text-sm transition-colors duration-200 ${
                    period === 'year'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="שנה"
                >
                  שנה
                </button>
              </Tooltip>
              <Tooltip content="בחר טווח תאריכים מותאם אישית">
                <button
                  onClick={() => onPeriodChange('custom')}
                  className={`px-3 py-1 text-sm transition-colors duration-200 ${
                    period === 'custom'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="מותאם אישית"
                >
                  מותאם
                </button>
              </Tooltip>
            </div>
          </div>
          
          {/* Date Range Picker (for custom period) */}
          {period === 'custom' && (
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טווח תאריכים
                <Tooltip content="בחר תאריך התחלה וסיום">
                  <HiInformationCircle className="inline-block mr-1 text-gray-400 h-4 w-4" />
                </Tooltip>
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={onDateRangeChange}
              />
            </div>
          )}
          
          {/* Group By (only for dashboard view) */}
          {activeView === 'dashboard' && (
            <div className="w-full sm:w-1/5">
              <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-1">
                קיבוץ לפי
                <Tooltip content="בחר כיצד לקבץ את הנתונים בגרף">
                  <HiInformationCircle className="inline-block mr-1 text-gray-400 h-4 w-4" />
                </Tooltip>
              </label>
              <select
                id="groupBy"
                value={groupBy}
                onChange={(e) => onGroupByChange(e.target.value as 'day' | 'week' | 'month')}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                aria-label="קיבוץ לפי"
              >
                <option value="day">יום</option>
                <option value="week">שבוע</option>
                <option value="month">חודש</option>
              </select>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="w-full sm:w-auto sm:self-end flex space-x-2 space-x-reverse">
            {/* Refresh Button */}
            <Tooltip content="רענן את הנתונים">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="רענן"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <HiRefresh className="ml-1 -mr-1 h-5 w-5" />
                )}
                רענן
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
