import React from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { Integration } from './modules';
import { Store } from '../../../hooks/useStores';

interface InventoryIntegrationsProps {
  integrations: Integration[];
  loading: boolean;
  stores: Store[];
  onCreateIntegration: (type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom' | 'google-analytics' | 'google-ads' | 'facebook-ads' | 'google-search-console' | 'multi-supplier-manager') => void;
  onEditIntegration: (integration: Integration) => void;
  onDeleteIntegration: (integration: Integration) => void;
  onToggleIntegration: (integration: Integration) => void;
}

/**
 * Component for displaying and managing inventory and supplier integrations
 */
const InventoryIntegrations: React.FC<InventoryIntegrationsProps> = ({
  integrations,
  loading,
  stores,
  onCreateIntegration,
  onEditIntegration,
  onDeleteIntegration,
  onToggleIntegration
}) => {
  // Filter integrations to only include inventory and supplier related ones
  const inventoryIntegrations = integrations.filter(i => 
    ['multi-supplier-manager'].includes(i.type)
  );
  
  // Get store name by ID
  const getStoreName = (storeId: number | null) => {
    if (!storeId) return 'כל החנויות';
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : `חנות #${storeId}`;
  };
  
  return (
    <div>
      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Multi-Supplier Manager card */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Multi-Supplier Manager</h4>
              <p className="text-sm text-gray-500 mt-1">
                ניהול מחירי עלות של מוצרים ממספר ספקים שונים
              </p>
            </div>
            <button
              onClick={() => onCreateIntegration('multi-supplier-manager')}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
            >
              <HiOutlinePlus className="mr-1 h-4 w-4" />
              הוסף
            </button>
          </div>
          
          {/* List of existing integrations */}
          {inventoryIntegrations.length > 0 ? (
            <div className="mt-4 space-y-3">
              {inventoryIntegrations
                .map(integration => (
                  <div 
                    key={integration.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{integration.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        חנות: {getStoreName(integration.store_id)}
                      </div>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => onToggleIntegration(integration)}
                        className={`p-1.5 rounded-full ${
                          integration.is_enabled
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        title={integration.is_enabled ? 'פעיל' : 'לא פעיל'}
                      >
                        {integration.is_enabled ? (
                          <HiOutlineCheck className="h-4 w-4" />
                        ) : (
                          <HiOutlineX className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onEditIntegration(integration)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="ערוך"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteIntegration(integration)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"
                        title="מחק"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-center">
              <p className="text-sm text-gray-500">אין אינטגרציות מוגדרות</p>
            </div>
          )}
        </div>
        
        {/* Placeholder for future inventory integrations */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm opacity-60">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-medium text-gray-900">ניהול מלאי</h4>
              <p className="text-sm text-gray-500 mt-1">
                סנכרון מלאי בין מערכות שונות
              </p>
            </div>
            <button
              disabled
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-gray-400 cursor-not-allowed"
            >
              <HiOutlinePlus className="mr-1 h-4 w-4" />
              בקרוב
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-center">
            <p className="text-sm text-gray-500">יהיה זמין בקרוב</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryIntegrations;
