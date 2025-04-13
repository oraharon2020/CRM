import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, storesAPI } from '../services/api';
import Spinner from '../components/Spinner';
import OrderModal from '../components/OrderModal';
import StatusFilterPopup from '../components/StatusFilterPopup';
import StoreSelector from '../components/StoreSelector';
import DateRangePicker from '../components/DateRangePicker';
import { getStatusColor } from '../utils/status-mapping.utils';

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  date: string;
}

interface Status {
  value: string;
  label: string;
  color?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{startDate: string | null, endDate: string | null}>({
    startDate: null,
    endDate: null
  });
  const [period, setPeriod] = useState<string>('month'); // Default to month view
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([
    { value: 'בטיפול', label: 'בטיפול' },
    { value: 'הושלם', label: 'הושלם' },
    { value: 'בהמתנה', label: 'בהמתנה' },
    { value: 'בוטל', label: 'בוטל' },
  ]);
  
  // Fetch store statuses when store changes
  useEffect(() => {
    const fetchStoreStatuses = async () => {
      if (!selectedStoreId) return;
      
      try {
        const response = await storesAPI.getStoreStatuses(selectedStoreId);
        
        if (response.success && response.data) {
          // Combine standard and custom statuses
          const allStatuses = [
            ...response.data.standardStatuses,
            ...response.data.customStatuses
          ];
          
          setAvailableStatuses(allStatuses);
        }
      } catch (error) {
        console.error('Error fetching store statuses:', error);
      }
    };
    
    fetchStoreStatuses();
  }, [selectedStoreId]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        if (!selectedStoreId) {
          // If no store is selected, show empty state
          setOrders([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        // Prepare API parameters
        const params: any = {
          page: currentPage,
          limit: 5 // Items per page
        };
        
        // Add status filter if any are selected
        if (selectedStatuses.length > 0) {
          params.statuses = selectedStatuses;
        }
        
        // Add date filters
        if (dateRange.startDate && dateRange.endDate) {
          params.startDate = dateRange.startDate;
          params.endDate = dateRange.endDate;
        } else if (period) {
          params.period = period;
        }
        
        // Add search term if any
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        console.log('Fetching orders with params:', params);
        
        try {
          // Try to fetch real orders from API
          const response = await ordersAPI.getByStore(selectedStoreId, params);
          
          if (response.success && response.data && response.data.orders) {
            setOrders(response.data.orders);
            
            // Set pagination info from API response
            if (response.data.pagination) {
              setTotalPages(response.data.pagination.pages || 1);
            } else {
              setTotalPages(Math.ceil(response.data.orders.length / 5));
            }
          } else {
            console.warn('API response format unexpected, using sample data');
            useSampleData();
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          useSampleData();
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to use sample data when API fails
    const useSampleData = () => {
      // Sample data - different orders based on selected store
      let sampleOrders;
      
      // Get current date for filtering
      const currentDate = new Date();
      let startDate = new Date();
      let endDate = new Date();
      
      // Set date range based on period or custom dates
      if (dateRange.startDate && dateRange.endDate) {
        startDate = new Date(dateRange.startDate);
        endDate = new Date(dateRange.endDate);
      } else if (period === 'today') {
        // Just today
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
      } else if (period === 'week') {
        // Last 7 days
        startDate.setDate(currentDate.getDate() - 7);
      } else if (period === 'month') {
        // Last 30 days
        startDate.setDate(currentDate.getDate() - 30);
      } else if (period === 'year') {
        // Last 365 days
        startDate.setDate(currentDate.getDate() - 365);
      }
      
      if (selectedStoreId === 1734091091) {
        // Bellano store orders
        sampleOrders = [
          { id: 2001, customerName: 'לקוח של bellano 1', customerPhone: '050-1111111', total: 350, status: 'בטיפול', date: '2025-02-20' },
          { id: 2002, customerName: 'לקוח של bellano 2', customerPhone: '050-2222222', total: 420, status: 'הושלם', date: '2025-02-18' },
          { id: 2003, customerName: 'לקוח של bellano 3', customerPhone: '050-3333333', total: 280, status: 'בהמתנה', date: '2025-02-22' },
          { id: 2004, customerName: 'לקוח של bellano 4', customerPhone: '050-4444444', total: 560, status: 'ממתין לתשלום', date: '2025-02-21' },
          { id: 2005, customerName: 'לקוח של bellano 5', customerPhone: '050-5555555', total: 320, status: 'נשלח', date: '2025-02-15' },
          { id: 2006, customerName: 'לקוח של bellano 6', customerPhone: '050-6666666', total: 180, status: 'בוטל', date: '2025-02-10' },
          { id: 2007, customerName: 'לקוח של bellano 7', customerPhone: '050-7777777', total: 420, status: 'בטיפול', date: '2025-02-19' },
          { id: 2008, customerName: 'לקוח של bellano 8', customerPhone: '050-8888888', total: 290, status: 'הושלם', date: '2025-02-17' },
          { id: 2009, customerName: 'לקוח של bellano 9', customerPhone: '050-9999999', total: 510, status: 'בהמתנה', date: '2025-02-23' },
          { id: 2010, customerName: 'לקוח של bellano 10', customerPhone: '050-1010101', total: 370, status: 'נשלח', date: '2025-02-22' },
        ];
      } else if (selectedStoreId === 1734219687) {
        // Nalla store orders
        sampleOrders = [
          { id: 3001, customerName: 'לקוח של Nalla 1', customerPhone: '052-1111111', total: 450, status: 'בטיפול', date: '2025-02-19' },
          { id: 3002, customerName: 'לקוח של Nalla 2', customerPhone: '052-2222222', total: 380, status: 'הושלם', date: '2025-02-17' },
          { id: 3003, customerName: 'לקוח של Nalla 3', customerPhone: '052-3333333', total: 290, status: 'בהכנה', date: '2025-02-23' },
          { id: 3004, customerName: 'לקוח של Nalla 4', customerPhone: '052-4444444', total: 520, status: 'מוכן לאיסוף', date: '2025-02-20' },
          { id: 3005, customerName: 'לקוח של Nalla 5', customerPhone: '052-5555555', total: 340, status: 'נאסף', date: '2025-02-16' },
          { id: 3006, customerName: 'לקוח של Nalla 6', customerPhone: '052-6666666', total: 190, status: 'בוטל', date: '2025-02-11' },
          { id: 3007, customerName: 'לקוח של Nalla 7', customerPhone: '052-7777777', total: 430, status: 'בטיפול', date: '2025-02-18' },
          { id: 3008, customerName: 'לקוח של Nalla 8', customerPhone: '052-8888888', total: 300, status: 'הושלם', date: '2025-02-16' },
          { id: 3009, customerName: 'לקוח של Nalla 9', customerPhone: '052-9999999', total: 520, status: 'בהמתנה', date: '2025-02-22' },
          { id: 3010, customerName: 'לקוח של Nalla 10', customerPhone: '052-1010101', total: 380, status: 'בהכנה', date: '2025-02-21' },
        ];
      } else {
        // Default orders if no store is selected
        sampleOrders = [
          { id: 1001, customerName: 'ישראל ישראלי', customerPhone: '050-1234567', total: 350, status: 'בטיפול', date: '2025-02-20' },
          { id: 1002, customerName: 'שרה כהן', customerPhone: '052-7654321', total: 420, status: 'הושלם', date: '2025-02-18' },
          { id: 1003, customerName: 'יוסי לוי', customerPhone: '054-9876543', total: 280, status: 'בהמתנה', date: '2025-02-22' },
          { id: 1004, customerName: 'רחל אברהם', customerPhone: '053-1122334', total: 560, status: 'בטיפול', date: '2025-02-21' },
          { id: 1005, customerName: 'דוד שמעון', customerPhone: '050-5566778', total: 320, status: 'הושלם', date: '2025-02-15' },
          { id: 1006, customerName: 'מיכל כהן', customerPhone: '052-1122334', total: 180, status: 'בוטל', date: '2025-02-10' },
          { id: 1007, customerName: 'אבי לוי', customerPhone: '054-5566778', total: 420, status: 'בטיפול', date: '2025-02-19' },
          { id: 1008, customerName: 'חנה גולדברג', customerPhone: '053-9876543', total: 290, status: 'הושלם', date: '2025-02-17' },
          { id: 1009, customerName: 'יעקב כהן', customerPhone: '050-7654321', total: 510, status: 'בהמתנה', date: '2025-02-23' },
          { id: 1010, customerName: 'רותי אברהם', customerPhone: '052-1234567', total: 370, status: 'בטיפול', date: '2025-02-22' },
        ];
      }
      
      // Filter by date range
      const filteredByDate = sampleOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // Filter by selected statuses if any are selected
      let filteredOrders = filteredByDate;
      if (selectedStatuses.length > 0) {
        filteredOrders = filteredByDate.filter(order => selectedStatuses.includes(order.status));
      }
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.customerName.toLowerCase().includes(term) || 
          order.customerPhone.includes(term) || 
          order.id.toString().includes(term)
        );
      }
      
      // Set total pages (assuming 5 items per page)
      setTotalPages(Math.ceil(filteredOrders.length / 5));
      
      // Paginate
      const startIndex = (currentPage - 1) * 5;
      const paginatedOrders = filteredOrders.slice(startIndex, startIndex + 5);
      
      setOrders(paginatedOrders);
    };
    
    fetchOrders();
  }, [searchTerm, selectedStatuses, selectedStoreId, currentPage, period, dateRange]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleStoreChange = (storeId: number | null) => {
    setSelectedStoreId(storeId);
    setSelectedStatuses([]); // Reset selected statuses when store changes
    setCurrentPage(1); // Reset to first page on store change
  };
  
  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) {
      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };
      
      setDateRange({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });
      
      // Set period to custom when date range is selected
      setPeriod('custom');
    }
  };
  
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    
    // Clear custom date range when switching to predefined period
    if (newPeriod !== 'custom') {
      setDateRange({ startDate: null, endDate: null });
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">הזמנות</h1>
        <p className="text-gray-500">ניהול וצפייה בהזמנות</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 md:space-x-reverse">
          <div className="w-full md:w-1/5">
            <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">חנות</label>
            <StoreSelector 
              selectedStoreId={selectedStoreId} 
              onStoreChange={handleStoreChange} 
            />
          </div>
          
          {/* Date Range Filter */}
          <div className="w-full md:w-1/4">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">תקופה</label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => handlePeriodChange('today')}
                className={`px-2 py-1 text-xs ${
                  period === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                היום
              </button>
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-2 py-1 text-xs ${
                  period === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                שבוע
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-2 py-1 text-xs ${
                  period === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                חודש
              </button>
              <button
                onClick={() => handlePeriodChange('year')}
                className={`px-2 py-1 text-xs ${
                  period === 'year'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                שנה
              </button>
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`px-2 py-1 text-xs ${
                  period === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                מותאם
              </button>
            </div>
            
            {period === 'custom' && (
              <div className="mt-2">
                <DateRangePicker
                  startDate={dateRange.startDate ? new Date(dateRange.startDate) : null}
                  endDate={dateRange.endDate ? new Date(dateRange.endDate) : null}
                  onDateChange={handleDateRangeChange}
                />
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/5">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">חיפוש</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="חיפוש לפי שם, טלפון או מספר הזמנה"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/5">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
            <StatusFilterPopup
              statuses={availableStatuses}
              selectedStatuses={selectedStatuses}
              onStatusChange={handleStatusChange}
              buttonLabel={selectedStatuses.length > 0 ? `סינון לפי ${selectedStatuses.length} סטטוסים` : 'סינון לפי סטטוס'}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-auto self-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              onClick={() => {
                setSelectedOrderId(null);
                setIsModalOpen(true);
              }}
            >
              הזמנה חדשה
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner />
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מס׳ הזמנה
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    לקוח
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    טלפון
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₪{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-900 ml-3"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setIsModalOpen(true);
                        }}
                      >
                        ערוך
                      </button>
                      <button className="text-red-600 hover:text-red-900">מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            לא נמצאו הזמנות
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  מציג <span className="font-medium">{(currentPage - 1) * 5 + 1}</span> עד{' '}
                  <span className="font-medium">{Math.min(currentPage * 5, orders.length * totalPages)}</span> מתוך{' '}
                  <span className="font-medium">{orders.length * totalPages}</span> תוצאות
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">הקודם</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">הבא</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Order Modal */}
      <OrderModal
        orderId={selectedOrderId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          // In a real app, we would refresh the data from the API
          // For now, we'll just close the modal
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Orders;
