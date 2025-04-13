import React, { useState, useEffect } from 'react';
import { HiDocumentText } from 'react-icons/hi';
import { Integration } from './integrations/types';
import { useStores } from '../../hooks/useStores';
import StoreSelector from '../StoreSelector';
import { WebhookApiKeyGenerator } from './integrations/modules';

interface ElementorIntegrationFormProps {
  initialData: Integration | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ElementorIntegrationForm: React.FC<ElementorIntegrationFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [storeId, setStoreId] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [fieldMapping, setFieldMapping] = useState({
    name: 'name',
    email: 'email',
    phone: 'phone',
    message: 'message'
  });
  
  const { stores } = useStores();
  
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStoreId(initialData.store_id);
      setIsEnabled(initialData.is_enabled);
      setApiKey(initialData.api_key || '');
      setWebhookUrl(initialData.webhook_url || '');
      
      if (initialData.field_mapping) {
        setFieldMapping({
          ...fieldMapping,
          ...initialData.field_mapping
        });
      }
    }
  }, [initialData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      type: 'elementor',
      store_id: storeId,
      is_enabled: isEnabled,
      api_key: apiKey,
      webhook_url: webhookUrl,
      field_mapping: fieldMapping
    };
    
    onSave(formData);
  };
  
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <HiDocumentText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {initialData ? 'ערוך חיבור אלמנטור' : 'חיבור חדש לאלמנטור'}
            </h2>
            <p className="text-sm text-gray-500">הגדר חיבור לטפסי אלמנטור</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              שם החיבור
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="לדוגמה: טופס יצירת קשר - דף הבית"
              required
            />
          </div>
          
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
              חנות
            </label>
            <StoreSelector
              selectedStoreId={storeId}
              onStoreChange={setStoreId}
              includeAllStores
            />
            <p className="mt-1 text-xs text-gray-500">
              בחר חנות ספציפית או "כל החנויות" כדי לקבל לידים מכל החנויות
            </p>
          </div>
          
          <WebhookApiKeyGenerator
            apiKey={apiKey}
            setApiKey={setApiKey}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            integrationType="elementor"
            primaryColor="blue"
            storeId={storeId}
          />
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">מיפוי שדות</h3>
            <p className="text-xs text-gray-500 mb-3">
              הגדר כיצד שדות הטופס באלמנטור ימופו לשדות הליד במערכת
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700 mb-1">
                  שדה שם
                </label>
                <input
                  type="text"
                  id="fieldName"
                  value={fieldMapping.name}
                  onChange={(e) => setFieldMapping({ ...fieldMapping, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="name"
                />
              </div>
              
              <div>
                <label htmlFor="fieldEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  שדה אימייל
                </label>
                <input
                  type="text"
                  id="fieldEmail"
                  value={fieldMapping.email}
                  onChange={(e) => setFieldMapping({ ...fieldMapping, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email"
                />
              </div>
              
              <div>
                <label htmlFor="fieldPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  שדה טלפון
                </label>
                <input
                  type="text"
                  id="fieldPhone"
                  value={fieldMapping.phone}
                  onChange={(e) => setFieldMapping({ ...fieldMapping, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="phone"
                />
              </div>
              
              <div>
                <label htmlFor="fieldMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  שדה הודעה
                </label>
                <input
                  type="text"
                  id="fieldMessage"
                  value={fieldMapping.message}
                  onChange={(e) => setFieldMapping({ ...fieldMapping, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="message"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isEnabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
            />
            <label htmlFor="isEnabled" className="text-sm text-gray-700">
              הפעל חיבור זה
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            {initialData ? 'עדכן' : 'צור'} חיבור
          </button>
        </div>
      </form>
    </div>
  );
};

export default ElementorIntegrationForm;
