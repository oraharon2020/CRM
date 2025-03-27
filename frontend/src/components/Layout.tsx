import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import OrderModal from './OrderModal';
import LeadModal from './LeadModal';
import EventModal from './EventModal';
import { useModals } from '../contexts/ModalsContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Get modals state and actions
  const { 
    isOrderModalOpen, selectedOrder, closeOrderModal,
    isLeadModalOpen, selectedLead, closeLeadModal,
    isEventModalOpen, selectedEvent, closeEventModal
  } = useModals();
  
  // Close sidebar on route change (mobile only)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16"> {/* Add padding-top to account for fixed header */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 px-10 transition-all duration-300">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Global Modals */}
      <OrderModal 
        isOpen={isOrderModalOpen} 
        onClose={closeOrderModal} 
        orderId={selectedOrder?.id || null}
        onSave={() => {
          // This will be handled by the component's internal logic
          closeOrderModal();
        }}
      />
      
      <LeadModal 
        isOpen={isLeadModalOpen} 
        onClose={closeLeadModal} 
        lead={selectedLead || undefined}
        title={selectedLead ? 'עריכת ליד' : 'ליד חדש'}
        onSave={() => {
          // This will be handled by the component's internal logic
          closeLeadModal();
        }}
      />
      
      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={closeEventModal} 
        eventId={selectedEvent?.id || null}
        onSave={() => {
          // This will be handled by the component's internal logic
          closeEventModal();
        }}
      />
    </div>
  );
};

export default Layout;
