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
      } else {
        console.error('Failed to fetch stores:', response.message);
        setStores([]);
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
      
      const response = await storesAPI.delete(id);
      
      if (response.success) {
        // Refresh stores from API
        await fetchStores();
      } else {
        console.error('Failed to delete store:', response.message);
        alert('שגיאה במחיקת החנות: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting store:', error);
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
