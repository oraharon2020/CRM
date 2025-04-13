import React from 'react';
import { CashFlowData } from '../utils/types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';

interface TableRowProps {
  item: CashFlowData;
  showExpenses: boolean;
  onDateClick: (date: string) => void;
  onProductCostClick: (date: string) => void;
  onShippingCostClick: (date: string) => void;
  onMarketingExpenseChange: (
    date: string, 
    field: 'marketingFacebook' | 'marketingGoogle' | 'marketingTikTok', 
    value: number
  ) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  item,
  showExpenses,
  onDateClick,
  onProductCostClick,
  onShippingCostClick,
  onMarketingExpenseChange
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td 
        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
        onClick={() => onDateClick(item.date)}
        title="לחץ להצגת ההזמנות"
      >
        {formatDate(item.date)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(item.revenue)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.orderCount}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.productCount}
      </td>
      
      {showExpenses && item.expenses && (
        <>
          {/* Product Cost - New column */}
          <td 
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600 hover:underline"
            onClick={() => onProductCostClick(item.date)}
            title="לחץ להצגת פירוט עלויות המוצרים"
          >
            {formatCurrency(item.expenses.productCost || 0)}
          </td>
          
          {/* Shipping - Changed from input to clickable text */}
          <td 
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600 hover:underline"
            onClick={() => onShippingCostClick(item.date)}
            title="לחץ להצגת פירוט עלויות ההובלה"
          >
            {formatCurrency(item.expenses.shipping || 0)}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatCurrency(item.expenses.vatDeductible)}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatCurrency(item.expenses.nonVatDeductible)}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatCurrency(item.expenses.salary)}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <input
              type="number"
              className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right"
              value={(item.expenses.marketingFacebook || 0).toString()}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onMarketingExpenseChange(item.date, 'marketingFacebook', value);
              }}
            />
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <input
              type="number"
              className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right"
              value={(item.expenses.marketingGoogle || 0).toString()}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onMarketingExpenseChange(item.date, 'marketingGoogle', value);
              }}
            />
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <input
              type="number"
              className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right"
              value={(item.expenses.marketingTikTok || 0).toString()}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onMarketingExpenseChange(item.date, 'marketingTikTok', value);
              }}
            />
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatCurrency(item.expenses.vat)}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatCurrency(item.expenses.total)}
          </td>
          
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${(item.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(item.profit || 0)}
          </td>
          
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${(item.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(item.roi || 0)}
          </td>
        </>
      )}
    </tr>
  );
};

export default TableRow;
