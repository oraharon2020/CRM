import React, { useState } from 'react';
import { HiInformationCircle } from 'react-icons/hi';
import { ForecastResult, Expenses } from '../utils/types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface ForecastRowProps {
  forecast: ForecastResult | null;
  showExpenses: boolean;
}

const ForecastRow: React.FC<ForecastRowProps> = ({ forecast, showExpenses }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!forecast) {
    return null;
  }

  return (
    <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold">
      <td 
        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative"
        onClick={() => setShowTooltip(!showTooltip)}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center">
          <span className="font-bold text-blue-700">צפי לסוף החודש</span>
          <HiInformationCircle className="inline-block mr-1 h-5 w-5 text-blue-500" />
        </div>
        
        {showTooltip && (
          <div className="absolute z-10 top-full right-0 mt-1 w-80 p-4 bg-white rounded-md shadow-lg border border-blue-200 text-xs text-gray-700 text-right">
            <p className="font-bold mb-2 text-blue-700">אופן חישוב הצפי:</p>
            <p className="mb-1">צפי = (סכום עד כה ÷ ימים שחלפו) × סך הימים בחודש</p>
            
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <p className="font-bold text-gray-700">נתוני החישוב:</p>
              <p>• ימים בחודש: {forecast.meta.daysInMonth}</p>
              <p>• ימים שחלפו: {forecast.meta.daysWithData}</p>
              <p>• ימים שנותרו: {forecast.meta.daysRemaining}</p>
              <p>• ממוצע הכנסה יומי: {formatCurrency(forecast.meta.dailyAvg.revenue)}</p>
              {showExpenses && (
                <p>• ממוצע הוצאות יומי: {formatCurrency(forecast.meta.dailyAvg.expenses.total)}</p>
              )}
            </div>
            
            <p className="mt-3 text-xs text-gray-500">* הממוצע היומי מחושב רק מימים עם נתונים</p>
            <p className="mt-1 text-gray-500">לחץ שוב כדי לסגור</p>
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
        {formatCurrency(forecast.revenue)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
        {forecast.orderCount}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
        {forecast.productCount}
      </td>
      
      {showExpenses && (
        <>
          {/* Product Cost - New column */}
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.productCost)}
          </td>
          
          {/* Shipping - Moved to follow product cost */}
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.shipping)}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.vatDeductible)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.nonVatDeductible)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.salary)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.marketingFacebook)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.marketingGoogle)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.marketingTikTok)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.vat)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
            {formatCurrency(forecast.expenses.total)}
          </td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${forecast.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(forecast.profit)}
          </td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${forecast.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(forecast.roi)}
          </td>
        </>
      )}
    </tr>
  );
};

export default ForecastRow;
