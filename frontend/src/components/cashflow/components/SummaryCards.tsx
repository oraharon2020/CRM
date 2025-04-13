import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { Expenses } from '../utils/types';

interface SummaryCardsProps {
  revenue: number;
  orderCount: number;
  productCount: number;
  expenses?: Expenses;
  profit?: number;
  roi?: number;
  hasExpenses: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  revenue,
  orderCount,
  productCount,
  expenses,
  profit,
  roi,
  hasExpenses
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">סה"כ הכנסות</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(revenue)}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">סה"כ הזמנות</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{orderCount}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">סה"כ מוצרים</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{productCount}</p>
      </div>
      
      {hasExpenses && (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">סה"כ הוצאות</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(expenses?.total || 0)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">רווח נקי</h3>
            <p className={`text-2xl font-bold mt-1 ${(profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit || 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">ROI</h3>
            <p className={`text-2xl font-bold mt-1 ${(roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(roi || 0)}
            </p>
          </div>
        </>
      )}
      
      {/* Product and Shipping Costs Summary */}
      {hasExpenses && expenses && (
        <div className="col-span-1 md:col-span-3 lg:col-span-6 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">סיכום עלויות מוצר והובלה</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500">עלות מוצר</h4>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(expenses.productCost || 0)}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500">הובלות</h4>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(expenses.shipping || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Marketing Expenses Summary */}
      {hasExpenses && expenses && (
        <div className="col-span-1 md:col-span-3 lg:col-span-6 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">סיכום הוצאות שיווק</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500">פייסבוק</h4>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(expenses.marketingFacebook || 0)}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500">גוגל</h4>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(expenses.marketingGoogle || 0)}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500">טיקטוק</h4>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(expenses.marketingTikTok || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCards;
