import React, { useState, useEffect } from 'react';
import { HiCog } from 'react-icons/hi';
import { Integration } from './integrations/types';
import { useStores } from '../../hooks/useStores';
import StoreSelector from '../StoreSelector';
import { WebhookApiKeyGenerator } from './integrations/modules';

interface CustomIntegrationFormProps {
  initialData: Integration | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CustomIntegrationForm: React.FC<CustomIntegrationFormProps> = ({
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
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newCustomField, setNewCustomField] = useState('');
  
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
      
      if (initialData.settings?.customFields) {
        setCustomFields(initialData.settings.customFields);
      }
    }
  }, [initialData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      type: 'custom',
      store_id: storeId,
      is_enabled: isEnabled,
      api_key: apiKey,
      webhook_url: webhookUrl,
      field_mapping: fieldMapping,
      settings: {
        customFields
      }
    };
    
    onSave(formData);
  };
  
  
  const addCustomField = () => {
    if (newCustomField.trim() && !customFields.includes(newCustomField.trim())) {
      setCustomFields([...customFields, newCustomField.trim()]);
      setNewCustomField('');
    }
  };
  
  const removeCustomField = (field: string) => {
    setCustomFields(customFields.filter(f => f !== field));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-purple-50 p-4 border-b border-purple-100">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <HiCog className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {initialData ? 'ערוך חיבור מותאם אישית' : 'חיבור חדש מותאם אישית'}
            </h2>
            <p className="text-sm text-gray-500">הגדר חיבור מותאם אישית לקבלת לידים</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="לדוגמה: חיבור מותאם אישית"
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
            integrationType="custom"
            primaryColor="purple"
            storeId={storeId}
          />
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">מיפוי שדות</h3>
            <p className="text-xs text-gray-500 mb-3">
              הגדר כיצד שדות הטופס במערכת החיצונית ימופו לשדות הליד במערכת
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="message"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">שדות מותאמים אישית</h3>
            <p className="text-xs text-gray-500 mb-3">
              הוסף שדות מותאמים אישית שיתקבלו מהמערכת החיצונית
            </p>
            
            <div className="flex mb-3">
              <input
                type="text"
                value={newCustomField}
                onChange={(e) => setNewCustomField(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="שם השדה המותאם אישית"
              />
              <button
                type="button"
                onClick={addCustomField}
                className="px-3 py-2 border border-gray-300 border-r-0 rounded-l-md bg-purple-50 text-sm text-purple-700 hover:bg-purple-100"
              >
                הוסף
              </button>
            </div>
            
            {customFields.length > 0 ? (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <ul className="space-y-2">
                  {customFields.map((field, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{field}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(field)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        הסר
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">אין שדות מותאמים אישית</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isEnabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ml-2"
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
          >
            {initialData ? 'עדכן' : 'צור'} חיבור
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomIntegrationForm;
