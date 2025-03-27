import React from 'react';
import { NavLink } from 'react-router-dom';
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
  HiCash
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
}

const NavSection: React.FC<NavSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1 px-3">
        {children}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none lg:hidden"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          <nav className="mt-2 px-2">
            <NavSection title="ראשי">
              <NavItem to="/dashboard" icon={<HiHome className="h-5 w-5" />} label="לוח בקרה" />
              <NavItem to="/orders" icon={<HiShoppingCart className="h-5 w-5" />} label="הזמנות" badge="3" />
              <NavItem to="/calendar" icon={<HiCalendar className="h-5 w-5" />} label="יומן" />
            </NavSection>
            
            <NavSection title="ניהול">
              <NavItem to="/leads" icon={<HiUserGroup className="h-5 w-5" />} label="לידים" />
              <NavItem to="/analytics" icon={<HiChartBar className="h-5 w-5" />} label="ניתוח מכירות" />
              <NavItem to="/external-analytics" icon={<HiChartBar className="h-5 w-5" />} label="אנליטיקה חיצונית" />
            </NavSection>
            
            <NavSection title="דוחות">
              <NavItem to="/reports/sales" icon={<HiCash className="h-5 w-5" />} label="דוחות מכירות" />
              <NavItem to="/reports/performance" icon={<HiDocumentReport className="h-5 w-5" />} label="ביצועים" />
            </NavSection>
            
            {isAdmin && (
              <NavSection title="מערכת">
                <NavItem to="/settings" icon={<HiCog className="h-5 w-5" />} label="הגדרות" />
                <NavItem to="/support" icon={<HiSupport className="h-5 w-5" />} label="תמיכה" />
              </NavSection>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
