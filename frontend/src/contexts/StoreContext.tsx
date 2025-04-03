import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store } from '../hooks/useStores';
import { usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  setDefaultStore: (store: Store | null) => Promise<boolean>;
  stores: Store[];
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { getUser } = useAuth();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to set default store for the current user
  const setDefaultStore = async (store: Store | null): Promise<boolean> => {
    try {
      const user = getUser();
      if (!user) {
        console.warn('Cannot set default store: No user logged in');
        return false;
      }
      
      const storeId = store ? store.id : null;
      const response = await usersAPI.setDefaultStore(user.id, storeId);
      
      return response.success;
    } catch (error) {
      console.error('Error setting default store:', error);
      return false;
    }
  };

  useEffect(() => {
    // Load stores from API
    const loadStores = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const user = getUser();
        if (!user) {
          console.log('User not authenticated, skipping store loading');
          setLoading(false);
          return;
        }
        
        // Import the storesAPI
        const { storesAPI } = await import('../services/api');
        
        // Call the real API
        const response = await storesAPI.getAll();
        
        if (response.success && response.data) {
          setStores(response.data);
          
          // Try to load user's default store
          const user = getUser();
          if (user) {
            try {
              const defaultStoreResponse = await usersAPI.getDefaultStore(user.id);
              
              if (defaultStoreResponse.success) {
                if (defaultStoreResponse.migration_needed) {
                  console.log('Default store migration needed, using first store as default');
                } else if (defaultStoreResponse.default_store_id) {
                  // Find the store in the loaded stores
                  const defaultStore = response.data.find(
                    (store: Store) => store.id === defaultStoreResponse.default_store_id
                  );
                  
                  if (defaultStore) {
                    setSelectedStore(defaultStore);
                    console.log('Loaded default store:', defaultStore.name);
                    setLoading(false);
                    return;
                  }
                }
              }
            } catch (error) {
              console.error('Error loading default store:', error);
            }
          }
          
          // If no default store or error, set the first store as the selected store
          if (!selectedStore && response.data.length > 0) {
            setSelectedStore(response.data[0]);
          }
        } else {
          console.error('Failed to load stores:', response.message);
        }
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStores();
  }, []);

  return (
    <StoreContext.Provider value={{ 
      selectedStore, 
      setSelectedStore, 
      setDefaultStore,
      stores, 
      loading 
    }}>
      {children}
    </StoreContext.Provider>
  );
};
