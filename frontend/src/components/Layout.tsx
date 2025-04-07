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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Get modals state and actions
  const { 
    isOrderModalOpen, selectedOrder, closeOrderModal,
    isLeadModalOpen, selectedLead, closeLeadModal,
    isEventModalOpen, selectedEvent, closeEventModal
  } = useModals();
  
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
  
  // We've removed the automatic sidebar closing on route change to fix the toggle functionality
  
  const toggleSidebar = () => {
    console.log("Toggle sidebar called, current state:", sidebarOpen);
    setSidebarOpen(prevState => !prevState);
    // Force a re-render by triggering a state update
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);
  };
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex h-[calc(100vh-64px)]"> {/* Set a fixed height for the content area */}
        {/* Sidebar is fixed on desktop, toggle on mobile */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`flex-1 px-1 sm:px-4 md:px-6 lg:px-8 py-4 transition-all duration-300 overflow-y-auto ${sidebarOpen && isMobile ? 'opacity-50' : 'opacity-100'}`}>
          <div className="max-w-7xl mx-auto">
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
