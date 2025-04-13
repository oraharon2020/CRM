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
      // Add mounted flag to prevent state updates after unmount
      let isMounted = true;
      
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const user = getUser();
        if (!user) {
          console.log('User not authenticated, skipping store loading');
          if (isMounted) setLoading(false);
          return;
        }
        
        // Import the storesAPI
        const { storesAPI } = await import('../services/api');
        
        // Try to get stores from API first
        let storesData: Store[] = [];
        let apiSuccess = false;
        
        try {
          const response = await storesAPI.getAll();
          
          if (!isMounted) return;
          
          if (response.success && response.data) {
            storesData = response.data;
            apiSuccess = true;
            
            // Save stores to localStorage for backup
            localStorage.setItem('userStores', JSON.stringify(storesData));
            console.log('Stores saved to localStorage in StoreContext');
          } else {
            throw new Error('API returned unsuccessful response');
          }
        } catch (apiError) {
          if (!isMounted) return;
          
          console.error('Failed to load stores from API:', apiError);
          
          // Try to get stores from localStorage
          const savedStores = localStorage.getItem('userStores');
          if (savedStores) {
            try {
              storesData = JSON.parse(savedStores);
              console.log('Loaded stores from localStorage in StoreContext');
            } catch (parseError) {
              console.error('Error parsing localStorage stores:', parseError);
            }
          }
        }
        
        if (!isMounted) return;
        
        // If we have stores either from API or localStorage, use them
        if (storesData.length > 0) {
          setStores(storesData);
          
          // Try to load user's default store
          try {
            const defaultStoreResponse = await usersAPI.getDefaultStore(user.id);
            
            if (!isMounted) return;
            
            if (defaultStoreResponse.success) {
              if (defaultStoreResponse.migration_needed) {
                console.log('Default store migration needed, using first store as default');
              } else if (defaultStoreResponse.default_store_id) {
                // Find the store in the loaded stores
                const defaultStore = storesData.find(
                  (store: Store) => store.id === defaultStoreResponse.default_store_id
                );
                
                if (defaultStore) {
                  console.log('Found default store:', defaultStore.name);
                  setSelectedStore(defaultStore);
                  if (isMounted) setLoading(false);
                  return;
                } else {
                  console.log('Default store not found in loaded stores, ID:', defaultStoreResponse.default_store_id);
                }
              } else {
                console.log('No default store set for user');
              }
            } else {
              console.log('Failed to get default store:', defaultStoreResponse.message);
            }
          } catch (error) {
            if (!isMounted) return;
            console.error('Error loading default store:', error);
          }
          
          // Don't automatically select a store - let the user choose
          if (!selectedStore && storesData.length > 0) {
            console.log('No store automatically selected - waiting for user to choose');
            // Don't set any store automatically
          }
        } else {
          console.error('No stores found from API or localStorage');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading stores:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    const cleanup = () => {
      // This will be used by the isMounted flag inside loadStores
    };
    
    loadStores();
    
    // Return cleanup function
    return cleanup;
  }, []); // Remove getUser from dependencies - only run once on mount

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
