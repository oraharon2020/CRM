import React, { useState, useEffect } from 'react';
import { HiChevronDown, HiStar } from 'react-icons/hi';
import Spinner from './Spinner';
import { storesAPI } from '../services/api';
import { useStoreContext } from '../contexts/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { Store } from '../hooks/useStores';

interface StoreSelectorProps {
  selectedStoreId: number | null;
  onStoreChange: (storeId: number | null) => void;
  includeAllStores?: boolean;
  allStoresLabel?: string;
  showDefaultOption?: boolean;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ 
  selectedStoreId, 
  onStoreChange, 
  includeAllStores = false, 
  allStoresLabel = "כל החנויות",
  showDefaultOption = true
}) => {
  const { setDefaultStore } = useStoreContext();
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        try {
          // Call the real API
          const response = await storesAPI.getAll();
          let storesData: Store[] = [];
          
          if (response.success && response.data) {
            storesData = response.data;
          } else {
            // Fallback to sample data if API fails
            storesData = [
              {
                id: 1734091091,
                name: "bellano",
                url: "https://www.bellano.co.il",
                consumer_key: "sample_key_1",
                consumer_secret: "sample_secret_1",
                status: "active"
              },
              {
                id: 1734219687,
                name: "Nalla",
                url: "https://www.nalla.co.il",
                consumer_key: "sample_key_2",
                consumer_secret: "sample_secret_2",
                status: "active"
              },
              {
                id: 1734300123,
                name: "Fashion Store",
                url: "https://www.fashion-store.co.il",
                consumer_key: "sample_key_3",
                consumer_secret: "sample_secret_3",
                status: "inactive"
              }
            ];
          }
          
          // Filter only active stores
          const activeStores = storesData.filter(store => store.status === 'active');
          
          setStores(activeStores);
          
          // If no store is selected and we have stores, select the first one or null if includeAllStores is true
          if (selectedStoreId === undefined) {
            if (includeAllStores) {
              onStoreChange(null);
            } else if (activeStores.length > 0) {
              onStoreChange(activeStores[0].id);
            }
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('שגיאה בטעינת החנויות מהשרת');
        }
        
      } catch (error) {
        console.error('Error fetching stores:', error);
        setError('שגיאה בטעינת החנויות');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStores();
  }, [selectedStoreId, onStoreChange, includeAllStores]);

  const handleStoreSelect = (storeId: number) => {
    onStoreChange(storeId);
    setIsOpen(false);
  };
  
  const handleSetAsDefault = async (storeId: number) => {
    // Find the store object
    const store = stores.find(s => s.id === storeId);
    if (!store) return;
    
    try {
      // Set as default store
      const success = await setDefaultStore(store);
      
      if (success) {
        // Show success message
        alert(`החנות ${store.name} הוגדרה כברירת מחדל`);
      } else {
        // Show error message
        alert('שגיאה בהגדרת חנות ברירת מחדל');
      }
    } catch (error) {
      console.error('Error setting default store:', error);
      
      // Show a more user-friendly error message
      alert('שגיאה בהגדרת חנות ברירת מחדל. ייתכן שנדרשת מיגרציה של בסיס הנתונים.');
    }
  };

  const selectedStore = stores.find(store => store.id === selectedStoreId);

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="block text-sm font-medium text-gray-700 ml-0 sm:ml-2 mb-1 sm:mb-0">
          בחר חנות:
        </label>
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            className="inline-flex justify-between items-center w-full sm:w-48 rounded-md border border-gray-300 shadow-sm px-3 sm:px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading || stores.length === 0}
          >
            {loading ? (
              <div className="flex items-center">
                <Spinner size="sm" />
                <span className="mr-2">טוען...</span>
              </div>
            ) : error ? (
              <span className="text-red-500">שגיאה בטעינה</span>
            ) : stores.length === 0 ? (
              <span className="text-gray-500">אין חנויות זמינות</span>
            ) : selectedStore ? (
              <span>{selectedStore.name}</span>
            ) : selectedStoreId === null && includeAllStores ? (
              <span>{allStoresLabel}</span>
            ) : (
              <span className="text-gray-500">בחר חנות</span>
            )}
            <HiChevronDown className="mr-2 h-5 w-5 text-gray-400" />
          </button>

          {isOpen && stores.length > 0 && (
            <div className="origin-top-right absolute left-0 mt-2 w-full sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {includeAllStores && (
                  <button
                    onClick={() => onStoreChange(null)}
                    className={`block w-full text-right px-4 py-2 text-sm ${
                      selectedStoreId === null
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    role="menuitem"
                  >
                    {allStoresLabel}
                  </button>
                )}
                {stores.map((store) => (
                  <div key={store.id} className="relative">
                    <button
                      onClick={() => handleStoreSelect(store.id)}
                      className={`block w-full text-right px-4 py-2 text-sm ${
                        selectedStoreId === store.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      role="menuitem"
                    >
                      {store.name}
                    </button>
                    
                    {showDefaultOption && isAuthenticated() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsDefault(store.id);
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-600 p-1"
                        title="הגדר כברירת מחדל"
                      >
                        <HiStar className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default StoreSelector;
