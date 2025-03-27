import React, { useState, useCallback } from 'react';
import { 
  HiDownload, 
  HiChartBar, 
  HiCurrencyDollar, 
  HiShoppingCart,
  HiInformationCircle
} from 'react-icons/hi';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import Spinner from '../Spinner';

interface TimeSeriesData {
  date: string;
  orders: number;
  revenue: number;
  products_sold?: number;
}

interface SalesChartProps {
  data: TimeSeriesData[];
  groupBy: 'day' | 'week' | 'month';
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm text-gray-700">
              <span className="font-medium">{entry.name}: </span>
              {entry.name === 'הכנסות' ? `₪${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const SalesChart: React.FC<SalesChartProps> = ({ data, groupBy }) => {
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');
  const [chartView, setChartView] = useState<'line' | 'bar' | 'area'>('area');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format date based on groupBy
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (groupBy === 'day') {
      return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    } else if (groupBy === 'week') {
      return `שבוע ${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
    } else {
      return date.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' });
    }
  };
  
  // Format data for recharts
  const formattedData = sortedData.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));
  
  // Calculate average values for reference lines
  const avgRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0) / formattedData.length;
  const avgOrders = formattedData.reduce((sum, item) => sum + item.orders, 0) / formattedData.length;
  
  // Handle chart type change
  const handleChartTypeChange = (type: 'revenue' | 'orders') => {
    setIsLoading(true);
    setChartType(type);
    // Simulate loading for smoother transition
    setTimeout(() => setIsLoading(false), 300);
  };
  
  // Handle chart view change
  const handleChartViewChange = (view: 'line' | 'bar' | 'area') => {
    setIsLoading(true);
    setChartView(view);
    // Simulate loading for smoother transition
    setTimeout(() => setIsLoading(false), 300);
  };
  
  // Handle download chart as image
  const handleDownloadChart = useCallback(() => {
    // This is a placeholder for actual download functionality
    // In a real implementation, you would use html-to-image or similar library
    alert('הורדת תרשים כתמונה תהיה זמינה בקרוב');
  }, []);
  
  // Format Y-axis ticks
  const formatYAxisTick = (value: number): string => {
    if (chartType === 'revenue') {
      if (value >= 1000000) {
        return `₪${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `₪${(value / 1000).toFixed(0)}K`;
      }
      return `₪${value}`;
    }
    
    return value.toString();
  };
  
  // Get chart component based on view type
  const getChartComponent = () => {
    const commonProps = {
      data: formattedData,
      margin: { top: 10, right: 30, left: 20, bottom: 5 }
    };
    
    if (chartView === 'line') {
      return (
        <Line 
          type="monotone" 
          dataKey={chartType} 
          name={chartType === 'revenue' ? 'הכנסות' : 'הזמנות'}
          stroke={chartType === 'revenue' ? "#10B981" : "#3B82F6"} 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, stroke: "white" }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
        />
      );
    } else if (chartView === 'bar') {
      return (
        <Bar 
          dataKey={chartType} 
          name={chartType === 'revenue' ? 'הכנסות' : 'הזמנות'}
          fill={chartType === 'revenue' ? "#10B981" : "#3B82F6"} 
          radius={[4, 4, 0, 0]}
          barSize={sortedData.length > 20 ? 10 : sortedData.length > 10 ? 20 : 30}
        />
      );
    } else {
      return (
        <Area 
          type="monotone" 
          dataKey={chartType} 
          name={chartType === 'revenue' ? 'הכנסות' : 'הזמנות'}
          stroke={chartType === 'revenue' ? "#10B981" : "#3B82F6"} 
          fill={chartType === 'revenue' ? "url(#colorRevenue)" : "url(#colorOrders)"}
          strokeWidth={2}
        />
      );
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">מכירות לאורך זמן</h2>
          <div className="ml-2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
            <HiInformationCircle className="h-5 w-5" title="מציג מגמות מכירות והזמנות לאורך זמן" />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => handleChartTypeChange('revenue')}
              className={`px-3 py-1.5 text-sm flex items-center ${
                chartType === 'revenue'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <HiCurrencyDollar className="mr-1 h-4 w-4" />
              הכנסות
            </button>
            <button
              onClick={() => handleChartTypeChange('orders')}
              className={`px-3 py-1.5 text-sm flex items-center ${
                chartType === 'orders'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <HiShoppingCart className="mr-1 h-4 w-4" />
              הזמנות
            </button>
          </div>
          
          {/* Chart View Selector */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => handleChartViewChange('area')}
              className={`px-3 py-1.5 text-sm ${
                chartView === 'area'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors duration-200`}
              title="תצוגת שטח"
            >
              שטח
            </button>
            <button
              onClick={() => handleChartViewChange('line')}
              className={`px-3 py-1.5 text-sm ${
                chartView === 'line'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors duration-200`}
              title="תצוגת קו"
            >
              קו
            </button>
            <button
              onClick={() => handleChartViewChange('bar')}
              className={`px-3 py-1.5 text-sm ${
                chartView === 'bar'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors duration-200`}
              title="תצוגת עמודות"
            >
              עמודות
            </button>
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownloadChart}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200 bg-gray-50 rounded-md border border-gray-300"
            title="הורד כתמונה"
          >
            <HiDownload className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {sortedData.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            אין נתונים זמינים
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  interval={formattedData.length > 20 ? 'preserveEnd' : 0}
                />
                
                <YAxis 
                  tickFormatter={formatYAxisTick}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
                
                {/* Reference line for average */}
                <ReferenceLine 
                  y={chartType === 'revenue' ? avgRevenue : avgOrders} 
                  stroke="#9CA3AF" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: 'ממוצע', 
                    position: 'right',
                    fill: '#6B7280',
                    fontSize: 12
                  }}
                />
                
                {getChartComponent()}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Chart insights */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">תובנות מהנתונים</h3>
          <p className="text-sm text-gray-600">
            {chartType === 'revenue' 
              ? `ממוצע ההכנסות עומד על ₪${Math.round(avgRevenue).toLocaleString()} ${
                  formattedData[formattedData.length - 1].revenue > avgRevenue 
                    ? 'עם מגמת עלייה בתקופה האחרונה' 
                    : 'עם מגמת ירידה בתקופה האחרונה'
                }`
              : `ממוצע ההזמנות עומד על ${Math.round(avgOrders).toLocaleString()} ${
                  formattedData[formattedData.length - 1].orders > avgOrders 
                    ? 'עם מגמת עלייה בתקופה האחרונה' 
                    : 'עם מגמת ירידה בתקופה האחרונה'
                }`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
