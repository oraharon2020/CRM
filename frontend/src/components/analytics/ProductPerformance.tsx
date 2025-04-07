import React, { useState, useEffect } from 'react';
import { 
  HiCollection, 
  HiChevronDown, 
  HiChevronUp, 
  HiSearch, 
  HiInformationCircle,
  HiSortAscending,
  HiSortDescending,
  HiCurrencyDollar,
  HiShoppingCart,
  HiTag
} from 'react-icons/hi';
import Tooltip from '../Tooltip';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';

interface ProductData {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  average_price: number;
}

interface ProductPerformanceProps {
  data: ProductData[];
}

// Helper function to get color based on performance
const getPerformanceColor = (percentage: number): string => {
  if (percentage >= 20) return 'bg-green-500';
  if (percentage >= 10) return 'bg-blue-500';
  if (percentage >= 5) return 'bg-purple-500';
  if (percentage >= 2) return 'bg-yellow-500';
  return 'bg-gray-500';
};

// Helper function to get text color based on performance
const getPerformanceTextColor = (percentage: number): string => {
  if (percentage >= 20) return 'text-green-600';
  if (percentage >= 10) return 'text-blue-600';
  if (percentage >= 5) return 'text-purple-600';
  if (percentage >= 2) return 'text-yellow-600';
  return 'text-gray-600';
};

const ProductPerformance: React.FC<ProductPerformanceProps> = ({ data }) => {
  // State for expanded view
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'average_price'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'all' | 'top5' | 'trending'>('top5');
  const [animateItems, setAnimateItems] = useState(false);
  
  // Sort data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    const factor = sortDirection === 'desc' ? -1 : 1;
    return factor * (a[sortBy] - b[sortBy]);
  });
  
  // Filter data based on search term
  const filteredData = sortedData.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate total revenue and quantity
  const totalRevenue = data.reduce((sum, product) => sum + product.revenue, 0);
  const totalQuantity = data.reduce((sum, product) => sum + product.quantity, 0);
  const avgPrice = totalRevenue / totalQuantity || 0;
  
  // Get products for display based on showAll state and active tab
  let displayProducts = filteredData;
  
  if (activeTab === 'top5') {
    displayProducts = [...filteredData]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  } else if (activeTab === 'trending') {
    // For demo purposes, we'll just show products with above average price
    displayProducts = [...filteredData]
      .filter(product => product.average_price > avgPrice)
      .sort((a, b) => b.average_price - a.average_price)
      .slice(0, 5);
  }
  
  if (!showAll && activeTab === 'all') {
    displayProducts = displayProducts.slice(0, 5);
  }
  
  // Handle sort change
  const handleSortChange = (newSortBy: 'revenue' | 'quantity' | 'average_price') => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
    
    // Trigger animation
    setAnimateItems(false);
    setTimeout(() => setAnimateItems(true), 50);
  };
  
  // Trigger animation on initial render
  useEffect(() => {
    setAnimateItems(true);
  }, []);
  
  // Handle tab change
  const handleTabChange = (tab: 'all' | 'top5' | 'trending') => {
    setActiveTab(tab);
    
    // Reset animation
    setAnimateItems(false);
    setTimeout(() => setAnimateItems(true), 50);
  };
  
  // Prepare data for mini charts
  const prepareChartData = (product: ProductData) => {
    return [
      { name: 'revenue', value: product.revenue },
      { name: 'quantity', value: product.quantity * product.average_price * 0.2 } // Scale for visualization
    ];
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-full text-purple-600 mr-3">
            <HiCollection className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">ביצועי מוצרים</h2>
          <Tooltip content="ניתוח המוצרים המובילים במכירות, כולל נתוני כמות, הכנסות ומחיר ממוצע">
            <HiInformationCircle className="ml-2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </Tooltip>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-700 font-medium">מוצרים שנמכרו</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalQuantity.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-full text-purple-700">
                <HiShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              {data.length} מוצרים שונים
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700 font-medium">הכנסות ממוצרים</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">₪{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-full text-blue-700">
                <HiCurrencyDollar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              ממוצע: ₪{Math.round(totalRevenue / data.length).toLocaleString()} למוצר
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700 font-medium">מחיר ממוצע</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">₪{avgPrice.toFixed(0)}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-full text-green-700">
                <HiTag className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              לכל פריט שנמכר
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex -mb-px space-x-6 space-x-reverse">
            <button
              onClick={() => handleTabChange('top5')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'top5'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors duration-200`}
            >
              מובילים בהכנסות
            </button>
            <button
              onClick={() => handleTabChange('trending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors duration-200`}
            >
              מחיר גבוה
            </button>
            <button
              onClick={() => handleTabChange('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors duration-200`}
            >
              כל המוצרים
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-md font-medium text-gray-700">
            {activeTab === 'top5' && 'מוצרים מובילים בהכנסות'}
            {activeTab === 'trending' && 'מוצרים במחיר גבוה'}
            {activeTab === 'all' && 'כל המוצרים'}
          </h3>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
            {/* Search input */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש מוצר..."
                className="block w-full pr-10 border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            
            {/* Sort buttons */}
            <div className="flex space-x-1 space-x-reverse">
              <button
                onClick={() => handleSortChange('revenue')}
                className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                  sortBy === 'revenue'
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors duration-200`}
              >
                הכנסות
                {sortBy === 'revenue' && (
                  sortDirection === 'desc' 
                    ? <HiSortDescending className="mr-1 h-4 w-4" />
                    : <HiSortAscending className="mr-1 h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('quantity')}
                className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                  sortBy === 'quantity'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors duration-200`}
              >
                כמות
                {sortBy === 'quantity' && (
                  sortDirection === 'desc' 
                    ? <HiSortDescending className="mr-1 h-4 w-4" />
                    : <HiSortAscending className="mr-1 h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('average_price')}
                className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                  sortBy === 'average_price'
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors duration-200`}
              >
                מחיר
                {sortBy === 'average_price' && (
                  sortDirection === 'desc' 
                    ? <HiSortDescending className="mr-1 h-4 w-4" />
                    : <HiSortAscending className="mr-1 h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {displayProducts.length > 0 ? (
            displayProducts.map((product, index) => {
              // Calculate percentage of total revenue
              const revenuePercentage = (product.revenue / totalRevenue) * 100;
              const quantityPercentage = (product.quantity / totalQuantity) * 100;
              const priceRatio = (product.average_price / avgPrice) * 100;
              
              // Get performance color
              const performanceColor = getPerformanceColor(revenuePercentage);
              const performanceTextColor = getPerformanceTextColor(revenuePercentage);
              
              // Prepare chart data
              const chartData = prepareChartData(product);
              
              return (
                <div 
                  key={product.id} 
                  className={`border border-gray-200 rounded-xl p-5 transition-all duration-500 hover:shadow-lg bg-white ${
                    animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="mb-3 sm:mb-0 flex-grow">
                      <div className="flex items-start">
                        <div className={`w-2 h-12 ${performanceColor} rounded-full mr-2 mt-1`}></div>
                        <div>
                          <Tooltip content={`מזהה מוצר: ${product.id}`}>
                            <h4 className="font-medium text-gray-900 text-lg">{product.name}</h4>
                          </Tooltip>
                          <p className="text-sm text-gray-500 flex items-center">
                            <span className="inline-block bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                              {product.sku}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">הכנסות</p>
                        <p className="font-semibold text-gray-900 text-lg">₪{product.revenue.toLocaleString()}</p>
                      </div>
                      
                      <div className="h-12 w-24 mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" barCategoryGap={1}>
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={index === 0 ? '#8B5CF6' : '#3B82F6'} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">כמות</p>
                        <p className="font-medium text-gray-900">{product.quantity}</p>
                        <p className="text-xs text-gray-500">{quantityPercentage.toFixed(1)}%</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">מחיר ממוצע</p>
                        <p className="font-medium text-gray-900">₪{product.average_price.toLocaleString()}</p>
                        <p className={`text-xs ${priceRatio > 100 ? 'text-green-500' : 'text-gray-500'}`}>
                          {priceRatio > 100 ? `+${(priceRatio - 100).toFixed(0)}%` : `${priceRatio.toFixed(0)}%`}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">% מההכנסות</p>
                        <p className={`font-medium ${performanceTextColor}`}>{revenuePercentage.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">מסך הכל</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div 
                        className={`${performanceColor} h-1.5 rounded-full transition-all duration-500`} 
                        style={{ width: `${revenuePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <HiSearch className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p>לא נמצאו מוצרים התואמים את החיפוש</p>
            </div>
          )}
        </div>
        
        {filteredData.length > 5 && activeTab === 'all' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
            >
              {showAll ? (
                <>
                  <HiChevronUp className="ml-2 -mr-1 h-5 w-5" />
                  הצג פחות
                </>
              ) : (
                <>
                  <HiChevronDown className="ml-2 -mr-1 h-5 w-5" />
                  הצג עוד {filteredData.length - 5} מוצרים
                </>
              )}
            </button>
          </div>
        )}
        
        {searchTerm && filteredData.length !== data.length && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              מציג {filteredData.length} מתוך {data.length} מוצרים
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPerformance;
