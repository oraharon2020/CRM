import React from 'react';
import { HiTrendingUp, HiTrendingDown, HiCurrencyDollar, HiShoppingCart, HiChartBar } from 'react-icons/hi';

interface ForecastData {
  next_period: {
    orders: number;
    revenue: number;
  };
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface SalesForecastProps {
  data: ForecastData;
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
}

const SalesForecast: React.FC<SalesForecastProps> = ({ data, period }) => {
  // Get next period name based on current period
  const getNextPeriodName = (): string => {
    switch (period) {
      case 'today':
        return 'מחר';
      case 'week':
        return 'שבוע הבא';
      case 'month':
        return 'חודש הבא';
      case 'year':
        return 'שנה הבאה';
      case 'custom':
        return 'תקופה הבאה';
      default:
        return 'תקופה הבאה';
    }
  };
  
  // Get confidence level text
  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) {
      return 'גבוהה';
    } else if (confidence >= 0.5) {
      return 'בינונית';
    } else {
      return 'נמוכה';
    }
  };
  
  // Get confidence level color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) {
      return 'text-green-600';
    } else if (confidence >= 0.5) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };
  
  // Get trend icon and color
  const getTrendIcon = () => {
    if (data.trend === 'up') {
      return <HiTrendingUp className="h-5 w-5 text-green-600" />;
    } else if (data.trend === 'down') {
      return <HiTrendingDown className="h-5 w-5 text-red-600" />;
    } else {
      return <HiChartBar className="h-5 w-5 text-yellow-600" />;
    }
  };
  
  const getTrendText = (): string => {
    if (data.trend === 'up') {
      return 'עולה';
    } else if (data.trend === 'down') {
      return 'יורד';
    } else {
      return 'יציב';
    }
  };
  
  const getTrendColor = (): string => {
    if (data.trend === 'up') {
      return 'text-green-600';
    } else if (data.trend === 'down') {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">תחזית מכירות</h2>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600 ml-3">
            {getTrendIcon()}
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-900">תחזית ל{getNextPeriodName()}</h3>
            <p className="text-sm text-gray-500">
              מגמה: <span className={getTrendColor()}>{getTrendText()}</span> | 
              רמת ביטחון: <span className={getConfidenceColor(data.confidence)}>
                {getConfidenceText(data.confidence)}
              </span> ({Math.round(data.confidence * 100)}%)
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-medium">הזמנות צפויות</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{data.next_period.orders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <HiShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-600 font-medium">הכנסות צפויות</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">₪{data.next_period.revenue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <HiCurrencyDollar className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Confidence meter */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>רמת ביטחון נמוכה</span>
            <span>רמת ביטחון גבוהה</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                data.confidence >= 0.8 ? 'bg-green-600' : 
                data.confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${data.confidence * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">הערה:</span> תחזית זו מבוססת על נתוני המכירות ההיסטוריים שלך ומגמות עונתיות. 
            התחזית מדויקת יותר ככל שיש יותר נתונים היסטוריים זמינים.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesForecast;
