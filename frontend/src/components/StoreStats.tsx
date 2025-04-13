import React, { useState, useEffect } from 'react';
import { HiRefresh, HiShoppingCart, HiCurrencyDollar, HiCash, HiCollection, HiFilter } from 'react-icons/hi';
import Spinner from './Spinner';
import DateRangePicker from './DateRangePicker';
import { storesAPI } from '../services/api';
import { useStatusSettings } from '../contexts/StatusSettingsContext';

interface StoreStatsProps {
  storeId: number;
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'year' | 'custom') => void;
  startDate?: Date | null;
  endDate?: Date | null;
  onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
}

interface StoreStats {
  orders: number;
  revenue: number;
  avg_order: number;
  products_sold: number;
}

const StoreStats: React.FC<StoreStatsProps> = ({ 
  storeId, 
  period, 
  onPeriodChange,
  startDate = null,
  endDate = null,
  onDateRangeChange
}) => {
  // Get status settings
  const { statusSettings } = useStatusSettings();
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date to YYYY-MM-DD for API with proper timezone handling
  const formatDateForAPI = (date: Date): string => {
    // Create a date string in YYYY-MM-DD format that respects the local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Toggle date picker
  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };
  
  // Handle date range change
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (onDateRangeChange) {
      onDateRangeChange(start, end);
    }
  };

  // Helper function to get sample stats data
  const getSampleStatsData = () => {
    let statsData;
    
    if (period === 'custom' && startDate && endDate) {
      // Calculate days between dates
      const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days <= 7) {
        // Similar to week stats but adjusted
        statsData = {
          orders: Math.round(12 * (days / 7)),
          revenue: Math.round(3600 * (days / 7)),
          avg_order: 300,
          products_sold: Math.round(25 * (days / 7))
        };
      } else if (days <= 31) {
        // Similar to month stats but adjusted
        statsData = {
          orders: Math.round(42 * (days / 30)),
          revenue: Math.round(12500 * (days / 30)),
          avg_order: 297.62,
          products_sold: Math.round(86 * (days / 30))
        };
      } else {
        // Similar to year stats but adjusted
        statsData = {
          orders: Math.round(156 * (days / 365)),
          revenue: Math.round(45800 * (days / 365)),
          avg_order: 293.59,
          products_sold: Math.round(312 * (days / 365))
        };
      }
    } else if (period === 'week') {
      statsData = {
        orders: 12,
        revenue: 3600,
        avg_order: 300,
        products_sold: 25
      };
    } else if (period === 'month') {
      statsData = {
        orders: 42,
        revenue: 12500,
        avg_order: 297.62,
        products_sold: 86
      };
    } else {
      statsData = {
        orders: 156,
        revenue: 45800,
        avg_order: 293.59,
        products_sold: 312
      };
    }
    
    return statsData;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare params based on period type
      let params: any = {};
      
      if (period === 'custom' && startDate && endDate) {
        params = {
          startDate: formatDateForAPI(startDate),
          endDate: formatDateForAPI(endDate)
        };
      } else {
        params = { period };
      }
      
      // Check if we have filtered statuses for this store
      const hasFilteredStatuses = storeId && 
        statusSettings.included_statuses && 
        statusSettings.included_statuses[storeId] && 
        statusSettings.included_statuses[storeId].length > 0;
      
      // Only show empty stats warning, but don't return zeros
      // This allows data to be displayed even when no statuses are selected
      const hasEmptyStatuses = storeId && 
          statusSettings.included_statuses && 
          statusSettings.included_statuses[storeId] && 
          statusSettings.included_statuses[storeId].length === 0;
      
      // Log status settings for debugging
      console.log('Status settings for store:', storeId, statusSettings.included_statuses[storeId]);
      
      // Add filtered statuses if available
      if (hasFilteredStatuses) {
        params.statuses = statusSettings.included_statuses[storeId];
      }
      
      // Debug logs
      console.log('Fetching stats with params:', params);
      console.log('Period:', period);
      console.log('Start date:', startDate);
      console.log('End date:', endDate);
      console.log('Statuses:', params.statuses);
      
      // Call the real API
      try {
        const response = await storesAPI.getStoreStats(storeId, params);
        console.log('Full API response in StoreStats component:', response);
        
        if (response && response.data && response.data.stats) {
          const statsData = response.data.stats;
          console.log('Stats data extracted:', statsData);
          setStats(statsData);
        } else {
          console.warn('API response format unexpected, using zeros');
          console.log('Unexpected response format:', response);
          // Return zeros if API response is not as expected
          setStats({
            orders: 0,
            revenue: 0,
            avg_order: 0,
            products_sold: 0
          });
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Return zeros if API fails
        setStats({
          orders: 0,
          revenue: 0,
          avg_order: 0,
          products_sold: 0
        });
      }
    } catch (error) {
      console.error('Error fetching store stats:', error);
      setError('שגיאה בטעינת נתוני החנות');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  useEffect(() => {
    // Ensure we refetch stats when any of these dependencies change
    fetchStats();
  }, [storeId, period, startDate, endDate, statusSettings]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
        >
          <HiRefresh className="h-4 w-4 ml-1" />
          נסה שוב
        </button>
      </div>
    );
  }
  
  // Check if we have filtered statuses for this store
  const hasFilteredStatuses = storeId && 
    statusSettings.included_statuses && 
    statusSettings.included_statuses[storeId] && 
    statusSettings.included_statuses[storeId].length > 0;
    
  // Check if we have empty statuses array (user explicitly selected none)
  const hasEmptyStatuses = storeId && 
    statusSettings.included_statuses && 
    statusSettings.included_statuses[storeId] && 
    statusSettings.included_statuses[storeId].length === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm text-gray-500">תקופה:</span>
          {hasFilteredStatuses && (
            <div className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
              <HiFilter className="w-3 h-3 ml-1" />
              <span>מסונן לפי סטטוסים</span>
            </div>
          )}
          {hasEmptyStatuses && (
            <div className="mr-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
              <HiFilter className="w-3 h-3 ml-1" />
              <span>לא נבחרו סטטוסים</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => onPeriodChange('today')}
              className={`px-3 py-1 text-sm ${
                period === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              היום
            </button>
            <button
              onClick={() => onPeriodChange('week')}
              className={`px-3 py-1 text-sm ${
                period === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              שבוע
            </button>
            <button
              onClick={() => onPeriodChange('month')}
              className={`px-3 py-1 text-sm ${
                period === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              חודש
            </button>
            <button
              onClick={() => onPeriodChange('year')}
              className={`px-3 py-1 text-sm ${
                period === 'year'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              שנה
            </button>
            <button
              onClick={() => onPeriodChange('custom')}
              className={`px-3 py-1 text-sm ${
                period === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              מותאם
            </button>
          </div>
          
          {period === 'custom' && (
            <div className="mr-2">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateRangeChange}
                isOpen={isDatePickerOpen}
                onToggle={toggleDatePicker}
              />
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            {refreshing ? (
              <Spinner size="sm" color="blue" />
            ) : (
              <HiRefresh className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {loading && !refreshing ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : hasEmptyStatuses ? (
          <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 font-medium">לא נבחרו סטטוסים</p>
            <p className="text-red-600 text-sm mt-1">בחר סטטוסים בהגדרות כדי לראות נתונים</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-600 font-medium">הזמנות</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.orders}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <HiShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-600 font-medium">הכנסות</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">₪{stats.revenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <HiCurrencyDollar className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">הזמנה ממוצעת</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">₪{stats.avg_order.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                  <HiCash className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-600 font-medium">מוצרים שנמכרו</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.products_sold}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                  <HiCollection className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            אין נתונים זמינים
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreStats;
