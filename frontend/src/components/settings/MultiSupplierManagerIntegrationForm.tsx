import React, { useState } from 'react';
import StoreSelector from '../StoreSelector';

interface IntegrationFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

/**
 * Form component for configuring Multi-Supplier Manager integration
 */
const MultiSupplierManagerIntegrationForm: React.FC<IntegrationFormProps> = ({ 
  onSave, 
  onCancel, 
  initialData 
}) => {
  // Basic information
  const [name, setName] = useState(initialData?.name || 'Multi-Supplier Manager');
  const [storeId, setStoreId] = useState(initialData?.store_id || null);
  
  // Connection details
  const [apiUrl, setApiUrl] = useState(initialData?.settings?.api_url || initialData?.config?.api_url || '');
  const [apiKey, setApiKey] = useState(initialData?.settings?.api_key || initialData?.config?.api_key || '');
  
  // Data settings
  const [includeCostPrices, setIncludeCostPrices] = useState(
    initialData?.settings?.include_cost_prices ?? initialData?.config?.include_cost_prices ?? true
  );
  const [includeShippingCosts, setIncludeShippingCosts] = useState(
    initialData?.settings?.include_shipping_costs ?? initialData?.config?.include_shipping_costs ?? true
  );
  
  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store ID is optional - if it doesn't exist, we'll save without it
    // This prevents foreign key constraint errors
    
    onSave({
      name,
      type: 'multi-supplier-manager',
      store_id: storeId, // This can be null
      is_enabled: initialData?.is_enabled ?? true,
      config: {
        api_url: apiUrl,
        api_key: apiKey,
        include_cost_prices: includeCostPrices,
        include_shipping_costs: includeShippingCosts
      }
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-500 text-white">
        <h3 className="text-lg font-semibold">
          {initialData ? 'ערוך אינטגרציית Multi-Supplier Manager' : 'הוסף אינטגרציית Multi-Supplier Manager'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Form fields */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            שם האינטגרציה
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            חנות
          </label>
          <StoreSelector
            selectedStoreId={storeId}
            onStoreChange={setStoreId}
            includeAllStores={false}
          />
          <p className="mt-1 text-sm text-gray-500">
            בחר את החנות שבה מותקן הפלאגין Multi-Supplier Manager
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            כתובת API
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com/wp-json/msm/v1"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            כתובת ה-API של הפלאגין, בדרך כלל בפורמט: https://your-site.com/wp-json/msm/v1
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            מפתח ה-API שנוצר בהגדרות הפלאגין
          </p>
        </div>
        
        {/* API Secret field removed as it's not needed for this integration */}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            הגדרות נתונים
          </label>
          
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeCostPrices}
                onChange={(e) => setIncludeCostPrices(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="mr-2 text-gray-700">כלול מחירי עלות</span>
            </label>
            <p className="mt-1 text-sm text-gray-500 mr-7">
              הצג את מחירי העלות של המוצרים בדף תזרים המזומנים
            </p>
          </div>
          
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeShippingCosts}
                onChange={(e) => setIncludeShippingCosts(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="mr-2 text-gray-700">כלול עלויות משלוח</span>
            </label>
            <p className="mt-1 text-sm text-gray-500 mr-7">
              הצג את עלויות המשלוח בדף תזרים המזומנים
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ml-2"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            שמור
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiSupplierManagerIntegrationForm;
