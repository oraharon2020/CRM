import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import SalesChart from './SalesChart';
import ProductPerformance from './ProductPerformance';
import CustomerSegments from './CustomerSegments';
import SalesForecast from './SalesForecast';
import Spinner from '../Spinner';

interface AnalyticsDashboardViewProps {
  analyticsData: any;
  loading: boolean;
  error: string | null;
  groupBy: 'day' | 'week' | 'month';
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
}

const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  analyticsData,
  loading,
  error,
  groupBy,
  period
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    // Check if it's a rate limiting error
    const isRateLimitError = error.toLowerCase().includes('rate limit') || 
                             error.toLowerCase().includes('too many requests');
    
    return (
      <div className={`flex items-start p-4 rounded-lg ${isRateLimitError ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
        <div className="flex-shrink-0 mr-3">
          {isRateLimitError ? (
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium">{isRateLimitError ? 'הגבלת קצב בקשות' : 'שגיאה'}</p>
          <p className="mt-1">{error}</p>
          {isRateLimitError && (
            <p className="mt-2 text-sm">
              המערכת מגבילה את מספר הבקשות שניתן לבצע בפרק זמן קצר. אנא המתן מספר שניות ונסה שוב.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">אין נתונים זמינים</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Analytics Dashboard */}
      <AnalyticsDashboard 
        data={analyticsData.summary} 
        timeSeries={analyticsData.time_series} 
      />
      
      {/* Sales Chart */}
      {analyticsData.time_series && (
        <SalesChart data={analyticsData.time_series} groupBy={groupBy} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        {analyticsData.product_performance && (
          <ProductPerformance data={analyticsData.product_performance} />
        )}
        
        {/* Customer Segments */}
        {analyticsData.customer_segments && (
          <CustomerSegments data={analyticsData.customer_segments} />
        )}
      </div>
      
      {/* Sales Forecast */}
      {analyticsData.forecasts && (
        <SalesForecast data={analyticsData.forecasts} period={period} />
      )}
    </div>
  );
};

export default AnalyticsDashboardView;
