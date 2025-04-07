import React from 'react';
import { HiX } from 'react-icons/hi';
import Spinner from '../../Spinner';
import { Order } from '../utils/types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface OrdersPopupProps {
  selectedDate: string | null;
  orders: Order[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

const OrdersPopup: React.FC<OrdersPopupProps> = ({
  selectedDate,
  orders,
  loading,
  error,
  onClose
}) => {
  if (!selectedDate) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            הזמנות ליום {formatDate(selectedDate)}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              אין הזמנות ליום זה
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מספר הזמנה
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך הזמנה
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם הלקוח
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPopup;
