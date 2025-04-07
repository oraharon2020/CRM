import React from 'react';
import { HiUsers, HiUserGroup, HiUserCircle } from 'react-icons/hi';

interface CustomerSegmentData {
  segment: string;
  customers: number;
  orders: number;
  revenue: number;
  average_order: number;
}

interface CustomerSegmentsProps {
  data: CustomerSegmentData[];
}

const CustomerSegments: React.FC<CustomerSegmentsProps> = ({ data }) => {
  // Calculate totals
  const totalCustomers = data.reduce((sum, segment) => sum + segment.customers, 0);
  const totalOrders = data.reduce((sum, segment) => sum + segment.orders, 0);
  const totalRevenue = data.reduce((sum, segment) => sum + segment.revenue, 0);
  
  // Get segment names in Hebrew
  const getSegmentName = (segment: string): string => {
    switch (segment) {
      case 'one_time':
        return 'חד פעמיים';
      case 'returning':
        return 'חוזרים';
      case 'loyal':
        return 'נאמנים';
      default:
        return segment;
    }
  };
  
  // Get segment icon
  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'one_time':
        return <HiUserCircle className="h-5 w-5" />;
      case 'returning':
        return <HiUsers className="h-5 w-5" />;
      case 'loyal':
        return <HiUserGroup className="h-5 w-5" />;
      default:
        return <HiUserCircle className="h-5 w-5" />;
    }
  };
  
  // Get segment color
  const getSegmentColor = (segment: string): string => {
    switch (segment) {
      case 'one_time':
        return 'bg-blue-100 text-blue-600';
      case 'returning':
        return 'bg-indigo-100 text-indigo-600';
      case 'loyal':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">פילוח לקוחות</h2>
        <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
          <HiUsers className="h-5 w-5" />
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <p className="text-sm text-indigo-600 font-medium">סה"כ לקוחות</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{totalCustomers}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-600 font-medium">סה"כ הזמנות</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{totalOrders}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-purple-600 font-medium">הזמנה ממוצעת</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              ₪{(totalRevenue / totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        
        {/* Segments visualization */}
        <div className="mb-6">
          <div className="flex h-8 rounded-lg overflow-hidden">
            {data.map((segment) => (
              <div
                key={segment.segment}
                className={`${
                  segment.segment === 'one_time' ? 'bg-blue-500' : 
                  segment.segment === 'returning' ? 'bg-indigo-500' : 'bg-purple-500'
                }`}
                style={{ width: `${(segment.customers / totalCustomers) * 100}%` }}
                title={`${getSegmentName(segment.segment)}: ${segment.customers} לקוחות (${((segment.customers / totalCustomers) * 100).toFixed(1)}%)`}
              ></div>
            ))}
          </div>
          
          <div className="flex justify-center mt-2 space-x-4 space-x-reverse">
            {data.map((segment) => (
              <div key={segment.segment} className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-1 ${
                  segment.segment === 'one_time' ? 'bg-blue-500' : 
                  segment.segment === 'returning' ? 'bg-indigo-500' : 'bg-purple-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {getSegmentName(segment.segment)} ({((segment.customers / totalCustomers) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Segment details */}
        <div className="space-y-4">
          {data.map((segment) => (
            <div key={segment.segment} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${getSegmentColor(segment.segment)}`}>
                    {getSegmentIcon(segment.segment)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{getSegmentName(segment.segment)}</h4>
                    <p className="text-sm text-gray-500">{segment.customers} לקוחות</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">הכנסות</p>
                  <p className="font-medium text-gray-900">₪{segment.revenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">הזמנות</p>
                  <p className="font-medium text-gray-900">{segment.orders}</p>
                  <p className="text-xs text-gray-500">
                    {(segment.orders / segment.customers).toFixed(1)} הזמנות ללקוח
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">הזמנה ממוצעת</p>
                  <p className="font-medium text-gray-900">₪{segment.average_order.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {((segment.revenue / totalRevenue) * 100).toFixed(1)}% מסך ההכנסות
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerSegments;
