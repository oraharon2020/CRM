import React, { createContext, useState, ReactNode } from 'react';
import { Lead } from '../types/lead.types';

// Define the types for our context
interface LeadFilters {
  storeId: number | null;
  searchTerm: string;
  status: string;
  source: string;
  assignee: string;
}

interface Order {
  id: number;
  // Add other order properties as needed
}

interface Event {
  id: number;
  // Add other event properties as needed
}

interface ModalsContextType {
  // Modal states
  isOrderModalOpen: boolean;
  isLeadModalOpen: boolean;
  isEventModalOpen: boolean;
  
  // Modal data
  selectedOrder: Order | null;
  selectedLead: Lead | null;
  selectedEvent: Event | null;
  
  // Lead filters state
  leadFilters: LeadFilters;
  
  // Actions
  openNewOrder: () => void;
  openExistingOrder: (order: Order) => void;
  closeOrderModal: () => void;
  
  openNewLead: () => void;
  openExistingLead: (lead: Lead) => void;
  closeLeadModal: () => void;
  
  openNewEvent: () => void;
  openExistingEvent: (event: Event) => void;
  closeEventModal: () => void;
  
  updateLeadFilters: (filters: Partial<LeadFilters>) => void;
}

// Create the context with default values
export const ModalsContext = createContext<ModalsContextType>({
  // Modal states
  isOrderModalOpen: false,
  isLeadModalOpen: false,
  isEventModalOpen: false,
  
  // Modal data
  selectedOrder: null,
  selectedLead: null,
  selectedEvent: null,
  
  // Lead filters state
  leadFilters: {
    storeId: null,
    searchTerm: '',
    status: '',
    source: '',
    assignee: '',
  },
  
  // Actions
  openNewOrder: () => {},
  openExistingOrder: () => {},
  closeOrderModal: () => {},
  
  openNewLead: () => {},
  openExistingLead: () => {},
  closeLeadModal: () => {},
  
  openNewEvent: () => {},
  openExistingEvent: () => {},
  closeEventModal: () => {},
  
  updateLeadFilters: () => {},
});

// Create the provider component
interface ModalsProviderProps {
  children: ReactNode;
}

export const ModalsProvider: React.FC<ModalsProviderProps> = ({ children }) => {
  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  // Modal data
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Lead filters state - persist in localStorage
  const [leadFilters, setLeadFilters] = useState<LeadFilters>(() => {
    const savedFilters = localStorage.getItem('leadFilters');
    return savedFilters 
      ? JSON.parse(savedFilters) 
      : {
          storeId: null,
          searchTerm: '',
          status: '',
          source: '',
          assignee: '',
        };
  });
  
  // Order modal actions
  const openNewOrder = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(true);
  };
  
  const openExistingOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };
  
  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };
  
  // Lead modal actions
  const openNewLead = () => {
    setSelectedLead(null);
    setIsLeadModalOpen(true);
  };
  
  const openExistingLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };
  
  const closeLeadModal = () => {
    setIsLeadModalOpen(false);
    setSelectedLead(null);
  };
  
  // Event modal actions
  const openNewEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };
  
  const openExistingEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };
  
  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };
  
  // Update lead filters and save to localStorage
  const updateLeadFilters = (filters: Partial<LeadFilters>) => {
    const newFilters = { ...leadFilters, ...filters };
    setLeadFilters(newFilters);
    localStorage.setItem('leadFilters', JSON.stringify(newFilters));
  };
  
  const value = {
    // Modal states
    isOrderModalOpen,
    isLeadModalOpen,
    isEventModalOpen,
    
    // Modal data
    selectedOrder,
    selectedLead,
    selectedEvent,
    
    // Lead filters state
    leadFilters,
    
    // Actions
    openNewOrder,
    openExistingOrder,
    closeOrderModal,
    
    openNewLead,
    openExistingLead,
    closeLeadModal,
    
    openNewEvent,
    openExistingEvent,
    closeEventModal,
    
    updateLeadFilters,
  };
  
  return (
    <ModalsContext.Provider value={value}>
      {children}
    </ModalsContext.Provider>
  );
};

// Custom hook for using the context
export const useModals = () => {
  const context = React.useContext(ModalsContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalsProvider');
  }
  return context;
};
