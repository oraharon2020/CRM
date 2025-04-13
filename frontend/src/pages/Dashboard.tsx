import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingCart, HiCalendar, HiCurrencyDollar, HiUsers, HiCog, HiOutlineUserAdd } from 'react-icons/hi';
import Spinner from '../components/Spinner';
import StoreSelector from '../components/StoreSelector';
import StoreStats from '../components/StoreStats';
import StatusSettingsModal from '../components/StatusSettingsModal';
import RecentLeads from '../components/leads/RecentLeads';
import LeadStats from '../components/leads/LeadStats';
import { dashboardAPI, ordersAPI, calendarAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useStatusSettings } from '../contexts/StatusSettingsContext';
import { useStoreContext } from '../contexts/StoreContext';
import { getStatusColor } from '../utils/status-mapping.utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          {loading ? (
            <div className="h-8 flex items-center">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')} text-${color.split('-')[1]}-500`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface RecentOrderProps {
  id: number;
  customerName: string;
  date: string;
  total: number;
  status: string;
}

const RecentOrder: React.FC<RecentOrderProps> = ({ id, customerName, date, total, status }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <Link to={`/orders/${id}`} className="text-blue-600 hover:text-blue-800">
          #{id}
        </Link>
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        {customerName}
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        {date}
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        ₪{total.toLocaleString()}
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

interface UpcomingTaskProps {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

const UpcomingTask: React.FC<UpcomingTaskProps> = ({ id, title, date, time, type, userId, priority, completed }) => {
  // Task type colors
  const typeColors: Record<string, string> = {
    'meeting': 'bg-purple-100 text-purple-800',
    'task': 'bg-blue-100 text-blue-800',
    'reminder': 'bg-yellow-100 text-yellow-800',
  };
  
  // Priority colors
  const priorityColors: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800',
  };
  
  // Priority labels
  const priorityLabels: Record<string, string> = {
    'low': 'נמוכה',
    'medium': 'בינונית',
    'high': 'גבוהה',
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-3 border-r-4 ${priority === 'high' ? 'border-red-500' : priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'} ${completed ? 'opacity-50' : ''}`}>
      <div className="flex justify-between">
        <div>
          <h3 className={`font-medium text-gray-900 ${completed ? 'line-through' : ''}`}>{title}</h3>
          <p className="text-sm text-gray-500">{date} | {time}</p>
        </div>
        <span className={`px-2 h-6 inline-flex items-center text-xs font-semibold rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
          {type === 'meeting' ? 'פגישה' : type === 'task' ? 'משימה' : 'תזכורת'}
        </span>
      </div>
      
      {/* Priority */}
      {priority && (
        <div className="mt-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[priority]}`}>
            {priorityLabels[priority]}
          </span>
        </div>
      )}
    </div>
  );
};

// Helper function to get sample orders
const getSampleOrders = (selectedStoreId: number | null, statsPeriod: string) => {
  if (selectedStoreId) {
    // Generate store-specific orders
    const storePrefix = selectedStoreId === 1734091091 ? 'B' : 'N';
    const storeName = selectedStoreId === 1734091091 ? 'bellano' : 'Nalla';
    
    // Generate different number of orders based on period
    const count = statsPeriod === 'week' ? 3 : statsPeriod === 'month' ? 5 : 10;
    
    const orders = [];
    for (let i = 0; i < count; i++) {
      // Use a numeric ID instead of trying to parse a string with a letter prefix
      orders.push({
        id: (storePrefix === 'B' ? 2000 : 3000) + i,
        customerName: `לקוח של ${storeName} ${i + 1}`,
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        total: 200 + Math.floor(Math.random() * 500),
        status: ['בטיפול', 'הושלם', 'בהמתנה'][i % 3]
      });
    }
    return orders;
  } else {
    // Default orders if no store is selected
    return [
      { id: 1005, customerName: 'דוד שמעון', date: '2025-02-15', total: 320, status: 'הושלם' },
      { id: 1004, customerName: 'רחל אברהם', date: '2025-02-21', total: 560, status: 'בטיפול' },
      { id: 1003, customerName: 'יוסי לוי', date: '2025-02-22', total: 280, status: 'בהמתנה' },
      { id: 1002, customerName: 'שרה כהן', date: '2025-02-18', total: 420, status: 'הושלם' },
      { id: 1001, customerName: 'ישראל ישראלי', date: '2025-02-20', total: 350, status: 'בטיפול' },
    ];
  }
};

const Dashboard: React.FC = () => {
  const { getUser } = useAuth();
  const currentUser = getUser();
  const { statusSettings } = useStatusSettings();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalCustomers: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrderProps[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskProps[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Store stats state
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('today');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const { selectedStore } = useStoreContext();
  
  // Set selected store ID from context when available
  // Set selected store ID from context only once on initial load
  useEffect(() => {
    if (selectedStore && selectedStoreId === null) {
      console.log('Setting selected store from context:', selectedStore.name);
      setSelectedStoreId(selectedStore.id);
    }
  }, [selectedStore]);
  
  // Status settings modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // Handle period change
  const handlePeriodChange = (period: 'today' | 'week' | 'month' | 'year' | 'custom') => {
    setStatsPeriod(period);
    
    // If switching to custom and no dates are set, set default date range (last 7 days)
    if (period === 'custom') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      
      console.log('Setting custom date range:', start, end);
      setStartDate(start);
      setEndDate(end);
    } else if (period === 'today') {
      // For 'today', set both start and end date to today
      const today = new Date();
      console.log('Setting today date range:', today);
      setStartDate(today);
      setEndDate(today);
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  // Format date to YYYY-MM-DD for API with proper timezone handling
  const formatDateForAPI = (date: Date): string => {
    // Create a date string in YYYY-MM-DD format that respects the local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch orders based on store and date range
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Prepare params based on selected store and date range
        let params: any = {};
        
        if (selectedStoreId) {
          params.storeId = selectedStoreId;
          
          // Add selected statuses if available
          if (statusSettings.included_statuses[selectedStoreId]) {
            params.statuses = statusSettings.included_statuses[selectedStoreId];
          }
        }
        
        if (statsPeriod === 'custom' && startDate && endDate) {
          params.startDate = formatDateForAPI(startDate);
          params.endDate = formatDateForAPI(endDate);
        } else {
          params.period = statsPeriod;
        }
        
        console.log('Dashboard fetchOrders - params:', params);
        
        // Get real orders from the API
        try {
          let response;
          if (selectedStoreId && statsPeriod === 'custom' && startDate && endDate) {
            // Get orders by store and date range
            console.log('Getting orders by store and date range');
            response = await ordersAPI.getByStore(
              selectedStoreId, 
              { 
                startDate: formatDateForAPI(startDate), 
                endDate: formatDateForAPI(endDate),
                statuses: params.statuses
              }
            );
          } else if (selectedStoreId) {
            // Get orders by store and period
            console.log('Getting orders by store and period');
            response = await ordersAPI.getByStore(selectedStoreId, { 
              period: statsPeriod,
              statuses: params.statuses
            });
          } else if (statsPeriod === 'custom' && startDate && endDate) {
            // Get orders by date range only
            console.log('Getting orders by date range only');
            response = await ordersAPI.getByDateRange(
              formatDateForAPI(startDate), 
              formatDateForAPI(endDate)
            );
          } else {
            // Get all orders with period filter
            console.log('Getting all orders with period filter');
            response = await ordersAPI.getAll({ period: statsPeriod });
          }
          
          console.log('Orders API response:', response);
          
          if (response && response.data && response.data.orders) {
            console.log('Setting real orders from API:', response.data.orders);
            setRecentOrders(response.data.orders);
          } else {
            // Fallback to sample data if API response is not as expected
            console.warn('API response format unexpected, using sample data');
            console.log('Unexpected response format:', response);
            const simulatedOrders = getSampleOrders(selectedStoreId, statsPeriod);
            console.log('Setting simulated orders:', simulatedOrders);
            setRecentOrders(simulatedOrders);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          // Fallback to sample data if API fails
          console.warn('API call failed, using sample data');
          const simulatedOrders = getSampleOrders(selectedStoreId, statsPeriod);
          console.log('Setting simulated orders after error:', simulatedOrders);
          setRecentOrders(simulatedOrders);
        }
      } catch (error) {
        console.error('Error in fetchOrders:', error);
        // Fallback to sample data if any error occurs
        const simulatedOrders = getSampleOrders(selectedStoreId, statsPeriod);
        setRecentOrders(simulatedOrders);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [selectedStoreId, statsPeriod, startDate, endDate, statusSettings]);
  
  // Fetch upcoming tasks from the API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Get the current user ID once
        const currentUserId = currentUser?.id;
        
        try {
          // Call the API to get upcoming tasks
          const response = await dashboardAPI.getUpcomingTasks();
          
          if (response && response.tasks) {
            // If we have a current user, filter tasks for that user
            if (currentUserId) {
              const userTasks = response.tasks.filter((task: any) => task.userId === currentUserId);
              setUpcomingTasks(userTasks);
            } else {
              // Otherwise show all tasks
              setUpcomingTasks(response.tasks);
            }
          } else {
            // Fallback to sample data if API response is not as expected
            console.warn('API response format unexpected, using sample data');
            // Simulate upcoming tasks with user assignments and priorities
            const allTasks = [
              { 
                id: 1, 
                title: 'פגישה עם לקוח', 
                date: '2025-02-26', 
                time: '10:00', 
                type: 'meeting',
                userId: 2,
                priority: 'high' as const,
                completed: false
              },
              { 
                id: 2, 
                title: 'משלוח הזמנה #1002', 
                date: '2025-02-27', 
                time: '12:00', 
                type: 'task',
                userId: 1,
                priority: 'medium' as const,
                completed: false
              },
              { 
                id: 3, 
                title: 'תזכורת: תשלום לספק', 
                date: '2025-02-28', 
                time: '09:00', 
                type: 'reminder',
                userId: 3,
                priority: 'low' as const,
                completed: false
              },
              { 
                id: 4, 
                title: 'פגישת צוות', 
                date: '2025-02-25', 
                time: '14:00', 
                type: 'meeting',
                userId: 1,
                priority: 'medium' as const,
                completed: false
              },
              { 
                id: 5, 
                title: 'בדיקת מלאי', 
                date: '2025-02-28', 
                time: '11:00', 
                type: 'task',
                userId: 2,
                priority: 'high' as const,
                completed: false
              }
            ];
            
            // Filter tasks for the current user if logged in
            if (currentUserId) {
              const userTasks = allTasks.filter(task => task.userId === currentUserId);
              setUpcomingTasks(userTasks);
            } else {
              // If no user is logged in or for demo purposes, show all tasks
              setUpcomingTasks(allTasks);
            }
          }
        } catch (error) {
          console.error('Error fetching tasks from API:', error);
          // Fallback to sample data if API fails
          console.warn('API call failed, using sample data');
          
          // Simulate upcoming tasks with user assignments and priorities
          const allTasks = [
            { 
              id: 1, 
              title: 'פגישה עם לקוח', 
              date: '2025-02-26', 
              time: '10:00', 
              type: 'meeting',
              userId: 2,
              priority: 'high' as const,
              completed: false
            },
            { 
              id: 2, 
              title: 'משלוח הזמנה #1002', 
              date: '2025-02-27', 
              time: '12:00', 
              type: 'task',
              userId: 1,
              priority: 'medium' as const,
              completed: false
            },
            { 
              id: 3, 
              title: 'תזכורת: תשלום לספק', 
              date: '2025-02-28', 
              time: '09:00', 
              type: 'reminder',
              userId: 3,
              priority: 'low' as const,
              completed: false
            },
            { 
              id: 4, 
              title: 'פגישת צוות', 
              date: '2025-02-25', 
              time: '14:00', 
              type: 'meeting',
              userId: 1,
              priority: 'medium' as const,
              completed: false
            },
            { 
              id: 5, 
              title: 'בדיקת מלאי', 
              date: '2025-02-28', 
              time: '11:00', 
              type: 'task',
              userId: 2,
              priority: 'high' as const,
              completed: false
            }
          ];
          
          // Filter tasks for the current user if logged in
          if (currentUserId) {
            const userTasks = allTasks.filter(task => task.userId === currentUserId);
            setUpcomingTasks(userTasks);
          } else {
            // If no user is logged in or for demo purposes, show all tasks
            setUpcomingTasks(allTasks);
          }
        }
      } catch (error) {
        console.error('Error in fetchTasks:', error);
      }
    };
    
    fetchTasks();
  }, [currentUser?.id]); // Add dependency on currentUser.id to update when user changes
  
  // Handle status settings modal
  const handleOpenStatusModal = () => {
    setIsStatusModalOpen(true);
  };
  
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
  };
  
  const handleSaveStatusSettings = () => {
    // Refresh data after saving status settings
    // The actual saving is handled in the StatusSettingsModal component
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">לוח בקרה</h1>
        <p className="text-gray-500">ברוך הבא למערכת ניהול הלקוחות</p>
      </div>
      
      {/* Store Selection */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-0">בחר חנות WooCommerce להצגת נתונים</h2>
          <div className="flex items-center space-x-2 space-x-reverse self-end sm:self-auto">
            <StoreSelector 
              selectedStoreId={selectedStoreId} 
              onStoreChange={setSelectedStoreId} 
            />
            
            {selectedStoreId && (
              <button
                onClick={handleOpenStatusModal}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title="הגדרות סטטוס"
              >
                <HiCog className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Store Statistics */}
      {selectedStoreId && (
        <div className="mb-6">
          <StoreStats 
            storeId={selectedStoreId} 
            period={statsPeriod} 
            onPeriodChange={handlePeriodChange}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
      )}
      
      {/* Recent Orders & Upcoming Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedStoreId ? 'הזמנות אחרונות מהחנות' : 'הזמנות אחרונות'}
            </h2>
            <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-800">
              צפה בכל ההזמנות
            </Link>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Spinner />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מס׳ הזמנה
                    </th>
                    <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      לקוח
                    </th>
                    <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך
                    </th>
                    <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סכום
                    </th>
                    <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <RecentOrder key={order.id} {...order} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {currentUser ? `המשימות שלי` : 'משימות קרובות'}
            </h2>
            <Link to="/calendar" className="text-sm text-blue-600 hover:text-blue-800">
              צפה ביומן
            </Link>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Spinner />
              </div>
            ) : upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <UpcomingTask key={task.id} {...task} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                אין משימות קרובות
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Leads Section */}
      <div className="mt-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">לידים אחרונים</h2>
          <Link to="/leads" className="text-sm text-blue-600 hover:text-blue-800">
            צפה בכל הלידים
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Lead Stats - 1 column */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">סטטיסטיקות לידים</h3>
            </div>
            <div className="p-6">
              <LeadStats storeId={selectedStoreId} />
            </div>
          </div>
          
          {/* Recent Leads - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">לידים אחרונים</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <RecentLeads storeId={selectedStoreId} limit={5} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Settings Modal */}
      <StatusSettingsModal
        storeId={selectedStoreId}
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        onSave={handleSaveStatusSettings}
      />
    </div>
  );
};

export default Dashboard;
