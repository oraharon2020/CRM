import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalsContext';
import { 
  HiMenu, HiBell, HiOutlineLogout, HiUser, HiCog, 
  HiOutlineOfficeBuilding, HiSearch, HiPlus, 
  HiOutlineDocumentAdd, HiOutlineUserAdd, HiOutlineCalendar
} from 'react-icons/hi';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuthContext();
  const { openNewOrder, openNewLead, openNewEvent } = useModals();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Close menus when clicking outside and handle window resize
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setQuickActionsOpen(false);
      }
    }
    
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const notifications = [
    { id: 1, text: 'הזמנה חדשה התקבלה', time: 'לפני 5 דקות', read: false },
    { id: 2, text: 'ליד חדש נוסף למערכת', time: 'לפני שעה', read: false },
    { id: 3, text: 'תזכורת: פגישה בשעה 14:00', time: 'לפני 3 שעות', read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <header className="bg-white shadow-md z-20 sticky top-0">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button and logo */}
          <div className="flex items-center">
            {/* Menu button - only visible on mobile */}
            <button
              type="button"
              className="md:hidden text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                console.log("Menu button clicked");
                toggleSidebar();
              }}
              aria-label="פתח תפריט"
            >
              <HiMenu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="mr-4 flex items-center group">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-1.5 rounded-md mr-2 group-hover:from-blue-700 group-hover:to-blue-600 transition-all duration-200 shadow-sm">
                <HiOutlineOfficeBuilding className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Global CRM</h1>
            </Link>
          </div>
          
          {/* Center - Search bar */}
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="חיפוש..."
              />
            </div>
          </div>
          
          {/* Right side - Quick actions, notifications, and user menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Quick Actions */}
            <div className="relative" ref={quickActionsRef}>
              <button
                type="button"
                className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-blue-600 focus:outline-none transition-all duration-200"
                aria-label="פעולות מהירות"
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              >
                <HiPlus className="h-6 w-6" />
              </button>
              
              {/* Quick Actions dropdown */}
              {quickActionsOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">פעולות מהירות</h3>
                    </div>
                    <button 
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => {
                        setQuickActionsOpen(false);
                        openNewOrder();
                      }}
                    >
                      <div className="flex items-center">
                        <HiOutlineDocumentAdd className="ml-2 h-4 w-4 text-gray-500" />
                        הזמנה חדשה
                      </div>
                    </button>
                    <button 
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => {
                        setQuickActionsOpen(false);
                        openNewLead();
                      }}
                    >
                      <div className="flex items-center">
                        <HiOutlineUserAdd className="ml-2 h-4 w-4 text-gray-500" />
                        ליד חדש
                      </div>
                    </button>
                    <button 
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => {
                        setQuickActionsOpen(false);
                        openNewEvent();
                      }}
                    >
                      <div className="flex items-center">
                        <HiOutlineCalendar className="ml-2 h-4 w-4 text-gray-500" />
                        אירוע חדש
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-blue-600 focus:outline-none transition-all duration-200"
                aria-label="התראות"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="relative inline-block">
                  <HiBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </span>
              </button>
              
              {/* Notifications dropdown */}
              {notificationsOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">התראות</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${notification.read ? '' : 'bg-blue-50'}`}
                          >
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                              {!notification.read && (
                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          אין התראות חדשות
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-150">
                        סמן הכל כנקרא
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none p-1 hover:bg-gray-100 transition-all duration-200"
                id="user-menu"
                aria-label="תפריט משתמש"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="mr-2 text-gray-700 font-medium hidden sm:inline-block">{user?.name}</span>
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                  <HiUser className="h-5 w-5" />
                </div>
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <HiCog className="ml-2 h-4 w-4 text-gray-500" />
                        הגדרות
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <HiOutlineLogout className="ml-2 h-4 w-4 text-gray-500" />
                        התנתק
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </header>
  );
};

export default Header;
