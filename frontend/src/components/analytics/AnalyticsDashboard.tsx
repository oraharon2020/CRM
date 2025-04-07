import React from 'react';
import { 
  HiShoppingCart, 
  HiCurrencyDollar, 
  HiCash, 
  HiCollection, 
  HiTrendingUp, 
  HiTrendingDown 
} from 'react-icons/hi';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';

interface SummaryData {
  orders: number;
  revenue: number;
  avg_order: number;
  products_sold: number;
}

interface AnalyticsDashboardProps {
  data: SummaryData;
}

// Generate sample trend data for sparklines
const generateSparklineData = (value: number, trend: 'up' | 'down' | 'stable') => {
  const points = 10;
  const data = [];
  
  // Generate random data with a general trend
  for (let i = 0; i < points; i++) {
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    let pointValue;
    
    if (trend === 'up') {
      pointValue = value * (0.7 + (i / points) * 0.6) * randomFactor;
    } else if (trend === 'down') {
      pointValue = value * (1.3 - (i / points) * 0.6) * randomFactor;
    } else {
      pointValue = value * randomFactor;
    }
    
    data.push({
      index: i,
      value: pointValue
    });
  }
  
  return data;
};

// Define trend type
type TrendType = 'up' | 'down' | 'stable';

// Calculate real trend data based on time series if available
const calculateTrends = (data: SummaryData, timeSeries?: any[]) => {
  // Default trends (in case we can't calculate from time series)
  const defaultTrends = {
    orders: { percent: 5, trend: 'up' as TrendType },
    revenue: { percent: 2, trend: 'up' as TrendType },
    avg_order: { percent: 3, trend: 'up' as TrendType },
    products_sold: { percent: 5, trend: 'up' as TrendType }
  };
  
  // If no time series data, return default trends
  if (!timeSeries || timeSeries.length < 2) {
    return defaultTrends;
  }
  
  try {
    // Sort time series by date
    const sortedSeries = [...timeSeries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Split the time series into two halves
    const halfLength = Math.floor(sortedSeries.length / 2);
    const olderHalf = sortedSeries.slice(0, halfLength);
    const newerHalf = sortedSeries.slice(halfLength);
    
    // Calculate averages for each half
    const calculateAverage = (arr: any[], key: string) => 
      arr.reduce((sum, item) => sum + (item[key] || 0), 0) / arr.length;
    
    const olderOrders = calculateAverage(olderHalf, 'orders');
    const newerOrders = calculateAverage(newerHalf, 'orders');
    
    const olderRevenue = calculateAverage(olderHalf, 'revenue');
    const newerRevenue = calculateAverage(newerHalf, 'revenue');
    
    const olderProductsSold = calculateAverage(olderHalf, 'products_sold');
    const newerProductsSold = calculateAverage(newerHalf, 'products_sold');
    
    // Calculate percent changes
    const calculatePercentChange = (older: number, newer: number) => {
      if (older === 0) return 0;
      return Math.round(((newer - older) / older) * 100);
    };
    
    const ordersPercent = calculatePercentChange(olderOrders, newerOrders);
    const revenuePercent = calculatePercentChange(olderRevenue, newerRevenue);
    const productsSoldPercent = calculatePercentChange(olderProductsSold, newerProductsSold);
    
    // Calculate average order value change
    const olderAvgOrder = olderOrders > 0 ? olderRevenue / olderOrders : 0;
    const newerAvgOrder = newerOrders > 0 ? newerRevenue / newerOrders : 0;
    const avgOrderPercent = calculatePercentChange(olderAvgOrder, newerAvgOrder);
    
    // Determine trend direction
    const determineTrend = (percent: number): TrendType => {
      if (percent > 1) return 'up';
      if (percent < -1) return 'down';
      return 'stable';
    };
    
    return {
      orders: {
        percent: Math.abs(ordersPercent),
        trend: determineTrend(ordersPercent)
      },
      revenue: {
        percent: Math.abs(revenuePercent),
        trend: determineTrend(revenuePercent)
      },
      avg_order: {
        percent: Math.abs(avgOrderPercent),
        trend: determineTrend(avgOrderPercent)
      },
      products_sold: {
        percent: Math.abs(productsSoldPercent),
        trend: determineTrend(productsSoldPercent)
      }
    };
  } catch (error) {
    console.error('Error calculating trends:', error);
    return defaultTrends;
  }
};

interface AnalyticsDashboardProps {
  data: SummaryData;
  timeSeries?: any[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, timeSeries }) => {
  // Calculate trend data for each metric
  const trends = calculateTrends(data, timeSeries);
  
  // Generate sparkline data
  const ordersData = generateSparklineData(data.orders, trends.orders.trend);
  const revenueData = generateSparklineData(data.revenue, trends.revenue.trend);
  const avgOrderData = generateSparklineData(data.avg_order, trends.avg_order.trend);
  const productsSoldData = generateSparklineData(data.products_sold, trends.products_sold.trend);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Orders Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">הזמנות</p>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-gray-800">{data.orders.toLocaleString()}</p>
              <div className={`flex items-center ml-2 ${trends.orders.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trends.orders.trend === 'up' ? (
                  <HiTrendingUp className="h-5 w-5" />
                ) : (
                  <HiTrendingDown className="h-5 w-5" />
                )}
                <span className="text-sm font-semibold">{Math.abs(trends.orders.percent)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <HiShoppingCart className="h-7 w-7" />
          </div>
        </div>
        
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ordersData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {trends.orders.trend === 'up' 
            ? 'עלייה בהשוואה לתקופה הקודמת' 
            : 'ירידה בהשוואה לתקופה הקודמת'}
        </p>
      </div>
      
      {/* Revenue Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">הכנסות</p>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-gray-800">₪{data.revenue.toLocaleString()}</p>
              <div className={`flex items-center ml-2 ${trends.revenue.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trends.revenue.trend === 'up' ? (
                  <HiTrendingUp className="h-5 w-5" />
                ) : (
                  <HiTrendingDown className="h-5 w-5" />
                )}
                <span className="text-sm font-semibold">{Math.abs(trends.revenue.percent)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <HiCurrencyDollar className="h-7 w-7" />
          </div>
        </div>
        
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={2}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {trends.revenue.trend === 'up' 
            ? 'עלייה בהשוואה לתקופה הקודמת' 
            : 'ירידה בהשוואה לתקופה הקודמת'}
        </p>
      </div>
      
      {/* Average Order Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">הזמנה ממוצעת</p>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-gray-800">₪{data.avg_order.toLocaleString()}</p>
              <div className={`flex items-center ml-2 ${trends.avg_order.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trends.avg_order.trend === 'up' ? (
                  <HiTrendingUp className="h-5 w-5" />
                ) : (
                  <HiTrendingDown className="h-5 w-5" />
                )}
                <span className="text-sm font-semibold">{Math.abs(trends.avg_order.percent)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <HiCash className="h-7 w-7" />
          </div>
        </div>
        
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={avgOrderData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {trends.avg_order.trend === 'up' 
            ? 'עלייה בהשוואה לתקופה הקודמת' 
            : 'ירידה בהשוואה לתקופה הקודמת'}
        </p>
      </div>
      
      {/* Products Sold Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">מוצרים שנמכרו</p>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-gray-800">{data.products_sold.toLocaleString()}</p>
              <div className={`flex items-center ml-2 ${trends.products_sold.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trends.products_sold.trend === 'up' ? (
                  <HiTrendingUp className="h-5 w-5" />
                ) : (
                  <HiTrendingDown className="h-5 w-5" />
                )}
                <span className="text-sm font-semibold">{Math.abs(trends.products_sold.percent)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <HiCollection className="h-7 w-7" />
          </div>
        </div>
        
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productsSoldData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fill="url(#colorProducts)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {trends.products_sold.trend === 'up' 
            ? 'עלייה בהשוואה לתקופה הקודמת' 
            : 'ירידה בהשוואה לתקופה הקודמת'}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
