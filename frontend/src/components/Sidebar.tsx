import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  HiHome, 
  HiShoppingCart, 
  HiCalendar, 
  HiOfficeBuilding, 
  HiCog,
  HiX,
  HiUserGroup,
  HiChartBar,
  HiSupport,
  HiDocumentReport,
  HiCash,
  HiChevronDown,
  HiChevronUp,
  HiUser
} from 'react-icons/hi';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 rounded-md my-1
        ${isActive 
          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-medium' 
          : 'hover:bg-gray-100 hover:text-gray-900'}
      `}
    >
      <span className="ml-3">{icon}</span>
      <span className="mx-3 font-medium">{label}</span>
      {badge && (
        <span className="mr-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isMobile: boolean;
}

const NavSection: React.FC<NavSectionProps> = ({ title, children, defaultOpen = true, isMobile }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-4">
      <button 
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? 
          <HiChevronUp className="h-4 w-4 text-gray-400" /> : 
          <HiChevronDown className="h-4 w-4 text-gray-400" />
        }
      </button>
      {isOpen && (
        <div className={`space-y-1 px-3 mt-1 ${isMobile ? 'animate-fadeIn' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle window resize
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // We've removed the problematic useEffect that was closing the sidebar automatically
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => {
            console.log("Backdrop clicked");
            toggleSidebar();
          }}
        />
      )}
      
      {/* Sidebar - fixed on desktop, toggle on mobile */}
      <aside
        className={`
          fixed top-0 bottom-0 right-0 z-40 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:h-screen
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
        style={{ height: '100vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {/* Logo and title - only visible on mobile */}
          <div className="flex items-center md:hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-1.5 rounded-md mr-2">
              <HiOfficeBuilding className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Global CRM</h2>
          </div>
          {/* Empty div for desktop to maintain spacing */}
          <div className="hidden md:block"></div>
          <button
            onClick={() => {
              console.log("Close sidebar button clicked");
              toggleSidebar();
            }}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none md:hidden transition-colors duration-200"
            aria-label="סגור תפריט"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-64px)] pb-20">
          <div className="px-4 py-2 mb-4">
            <div className="flex items-center p-2 bg-blue-50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                <HiUser className="h-6 w-6" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'משתמש'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'משתמש@example.com'}</p>
              </div>
            </div>
          </div>
          
          <nav className="px-2">
            <NavSection title="ראשי" isMobile={isMobile}>
              <NavItem to="/dashboard" icon={<HiHome className="h-5 w-5" />} label="לוח בקרה" />
              <NavItem to="/orders" icon={<HiShoppingCart className="h-5 w-5" />} label="הזמנות" badge="3" />
              <NavItem to="/calendar" icon={<HiCalendar className="h-5 w-5" />} label="יומן" />
            </NavSection>
            
            <NavSection title="ניהול" isMobile={isMobile}>
              <NavItem to="/leads" icon={<HiUserGroup className="h-5 w-5" />} label="לידים" />
              <NavItem to="/analytics" icon={<HiChartBar className="h-5 w-5" />} label="ניתוח מכירות" />
              <NavItem to="/external-analytics" icon={<HiChartBar className="h-5 w-5" />} label="אנליטיקה חיצונית" />
              <NavItem to="/cashflow" icon={<HiCash className="h-5 w-5" />} label="ניהול תזרים" />
            </NavSection>
            
            <NavSection title="דוחות" defaultOpen={!isMobile} isMobile={isMobile}>
              <NavItem to="/reports/sales" icon={<HiCash className="h-5 w-5" />} label="דוחות מכירות" />
              <NavItem to="/reports/performance" icon={<HiDocumentReport className="h-5 w-5" />} label="ביצועים" />
            </NavSection>
            
            {isAdmin && (
              <NavSection title="מערכת" defaultOpen={!isMobile} isMobile={isMobile}>
                <NavItem to="/settings" icon={<HiCog className="h-5 w-5" />} label="הגדרות" />
                <NavItem to="/support" icon={<HiSupport className="h-5 w-5" />} label="תמיכה" />
              </NavSection>
            )}
          </nav>
          
          <div className="px-4 py-6 mt-6 border-t border-gray-100">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-500 mb-2">גרסה 1.0.0</p>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200">
                תנאי שימוש
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
