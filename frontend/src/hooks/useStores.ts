import { useState, useEffect, useCallback } from 'react';
import { storesAPI } from '../services/api';
import { useAuth } from './useAuth';

export interface Store {
  id: number;
  name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
  status: 'active' | 'inactive';
  last_sync?: string;
}

interface UseStoresReturn {
  stores: Store[];
  filteredStores: Store[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  handleSaveStore: (storeData: Partial<Store>) => Promise<void>;
  handleDeleteStore: (id: number) => Promise<void>;
  handleSyncStore: (id: number) => Promise<void>;
  syncingStore: number | null;
}

export const useStores = (): UseStoresReturn => {
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingStore, setSyncingStore] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch stores
  const fetchStores = useCallback(async () => {
    // Skip API call if not authenticated
    if (!isAuthenticated()) {
      console.log('User not authenticated, skipping store fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await storesAPI.getAll();
      
      if (response.success && response.data) {
        setStores(response.data);
        
        // Save stores to localStorage for backup
        localStorage.setItem('userStores', JSON.stringify(response.data));
        console.log('Stores saved to localStorage in useStores');
      } else {
        console.error('Failed to fetch stores:', response.message);
        
        // Try to load from localStorage if API fails
        const savedStores = localStorage.getItem('userStores');
        if (savedStores) {
          try {
            const parsedStores = JSON.parse(savedStores);
            setStores(parsedStores);
            console.log('Loaded stores from localStorage in useStores');
          } catch (parseError) {
            console.error('Error parsing stores from localStorage:', parseError);
            setStores([]);
          }
        } else {
          setStores([]);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);
  
  // Filter stores when filters change
  useEffect(() => {
    const filtered = stores.filter(store => {
      const matchesSearch =
        searchTerm === '' ||
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        store.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredStores(filtered);
  }, [stores, searchTerm, statusFilter]);
  
  // Handle store creation/update
  const handleSaveStore = async (storeData: Partial<Store>) => {
    try {
      setLoading(true);
      
      let response;
      if (storeData.id) {
        // Update existing store
        response = await storesAPI.update(storeData.id, storeData);
        
        if (response.success) {
          // Refresh stores from API
          await fetchStores();
        } else {
          console.error('Failed to update store:', response.message);
          alert('שגיאה בעדכון החנות: ' + response.message);
        }
      } else {
        // Create new store
        response = await storesAPI.create(storeData);
        
        if (response.success) {
          // Refresh stores from API
          await fetchStores();
        } else {
          console.error('Failed to create store:', response.message);
          alert('שגיאה ביצירת החנות: ' + response.message);
        }
      }
    } catch (error) {
      console.error('Error saving store:', error);
      alert('שגיאה בשמירת החנות');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle store deletion
  const handleDeleteStore = async (id: number) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק חנות זו?')) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Attempting to delete store with ID:', id);
      
      // Find the store name first to provide better feedback to the user
      const storeToDelete = stores.find(store => store.id === id);
      const storeName = storeToDelete ? storeToDelete.name : `ID ${id}`;
      
      try {
        const response = await storesAPI.delete(id);
        console.log('API delete response:', response);
        
        if (response && response.success) {
          console.log(`Store "${storeName}" deleted successfully, refreshing store list`);
          
          // Update the local state immediately for better UX
          setStores(prevStores => prevStores.filter(store => store.id !== id));
          
          // Also refresh from the API to ensure we have the latest data
          await fetchStores();
          
          alert(`החנות "${storeName}" נמחקה בהצלחה`);
        } else {
          console.error('Failed to delete store:', response?.message || 'Unknown error');
          
          // Even if the API call failed, we can try to update the UI by removing the store locally
          // This provides a better user experience even when there are backend issues
          setStores(prevStores => prevStores.filter(store => store.id !== id));
          
          alert(`מחיקת החנות "${storeName}" מהשרת נכשלה, אך הוסרה מהתצוגה המקומית. פרטי שגיאה: ${response?.message || 'Unknown error'}`);
        }
      } catch (apiError) {
        console.error('API Error deleting store:', apiError);
        
        // Update local state even if API call fails completely
        setStores(prevStores => prevStores.filter(store => store.id !== id));
        
        alert(`אירעה שגיאה במחיקת החנות "${storeName}", אך הוסרה מהתצוגה המקומית`);
      }
    } catch (error) {
      console.error('Error in handleDeleteStore:', error);
      alert('שגיאה במחיקת החנות');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle store sync
  const handleSyncStore = async (id: number) => {
    try {
      setSyncingStore(id);
      
      const response = await storesAPI.syncStore(id);
      
      if (response.success) {
        // Refresh stores from API
        await fetchStores();
        // Show success message
        alert('החנות סונכרנה בהצלחה');
      } else {
        console.error('Failed to sync store:', response.message);
        alert('שגיאה בסנכרון החנות: ' + response.message);
      }
    } catch (error) {
      console.error('Error syncing store:', error);
      alert('שגיאה בסנכרון החנות');
    } finally {
      setSyncingStore(null);
    }
  };
  
  return {
    stores,
    filteredStores,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleSaveStore,
    handleDeleteStore,
    handleSyncStore,
    syncingStore
  };
};
