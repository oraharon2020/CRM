import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { Integration, IntegrationType } from './types';
import { useStores } from '../../../hooks/useStores';
import { getIntegrationTypeName } from './IntegrationUtils';
import StoreSelector from '../../StoreSelector';
import WebhookApiKeyGenerator from '../integrations/modules/WebhookApiKeyGenerator';

interface IntegrationModalProps {
  modalType: IntegrationType | null;
  editingIntegration: Integration | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const IntegrationModal: React.FC<IntegrationModalProps> = ({
  modalType,
  editingIntegration,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Integration, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    type: modalType || 'elementor',
    api_key: '',
    is_enabled: true,
    store_id: null,
    default_assignee: undefined,
    field_mapping: {},
    webhook_url: '',
    settings: {},
    leads_count: 0
  });
  
  const { stores } = useStores();
  
  useEffect(() => {
    if (editingIntegration) {
      setFormData({
        ...editingIntegration,
        field_mapping: editingIntegration.field_mapping || {},
        settings: editingIntegration.settings || {}
      });
    } else if (modalType) {
      setFormData({
        name: '',
        type: modalType,
        api_key: '',
        is_enabled: true,
        store_id: null,
        default_assignee: undefined,
        field_mapping: {},
        webhook_url: '',
        settings: {}
      });
    }
  }, [editingIntegration, modalType]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleStoreChange = (storeId: number | null) => {
    setFormData(prev => ({ ...prev, store_id: storeId }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const renderFormFields = () => {
    switch (formData.type) {
      case 'elementor':
      case 'contact-form-7':
      case 'facebook':
      case 'custom':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                שם האינטגרציה
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <WebhookApiKeyGenerator
                apiKey={formData.api_key || ''}
                setApiKey={(value) => setFormData(prev => ({ ...prev, api_key: value }))}
                webhookUrl={formData.webhook_url || ''}
                setWebhookUrl={(value) => setFormData(prev => ({ ...prev, webhook_url: value }))}
                integrationType={formData.type}
                primaryColor="blue"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                חנות
              </label>
              <StoreSelector
                selectedStoreId={formData.store_id}
                onStoreChange={handleStoreChange}
                includeAllStores={true}
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_enabled"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_enabled" className="mr-2 block text-sm text-gray-700">
                  פעיל
                </label>
              </div>
            </div>
          </>
        );
      
      case 'google-analytics':
      case 'google-ads':
      case 'facebook-ads':
      case 'google-search-console':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                שם האינטגרציה
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <WebhookApiKeyGenerator
                apiKey={formData.api_key || ''}
                setApiKey={(value) => setFormData(prev => ({ ...prev, api_key: value }))}
                webhookUrl={formData.webhook_url || ''}
                setWebhookUrl={(value) => setFormData(prev => ({ ...prev, webhook_url: value }))}
                integrationType={formData.type}
                primaryColor="yellow"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                חנות
              </label>
              <StoreSelector
                selectedStoreId={formData.store_id}
                onStoreChange={handleStoreChange}
                includeAllStores={true}
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_enabled"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_enabled" className="mr-2 block text-sm text-gray-700">
                  פעיל
                </label>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {editingIntegration ? 'עריכת אינטגרציה' : 'הוספת אינטגרציה חדשה'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              סוג אינטגרציה
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {getIntegrationTypeName(formData.type)}
            </div>
          </div>
          
          {renderFormFields()}
          
          <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
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
              {editingIntegration ? 'שמור שינויים' : 'צור אינטגרציה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntegrationModal;
