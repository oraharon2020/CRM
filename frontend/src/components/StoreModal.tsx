import React, { useState, useEffect } from 'react';
import { HiTrash } from 'react-icons/hi';
import Spinner from './Spinner';
import { Store } from '../hooks/useStores';

interface StoreModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeData: Partial<Store>) => void;
  title?: string;
}

const StoreModal: React.FC<StoreModalProps> = ({
  store,
  isOpen,
  onClose,
  onSave,
  title = 'חנות חדשה'
}) => {
  const [formData, setFormData] = useState<Omit<Store, 'id' | 'last_sync'>>({
    name: '',
    url: '',
    consumer_key: '',
    consumer_secret: '',
    status: 'active',
  });
  
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        url: store.url,
        consumer_key: store.consumer_key,
        consumer_secret: '********', // Don't show the actual secret
        status: store.status,
      });
    } else {
      setFormData({
        name: '',
        url: '',
        consumer_key: '',
        consumer_secret: '',
        status: 'active',
      });
    }
  }, [store]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const storeData: Partial<Store> = {
        ...formData
      };
      
      // Don't send the masked secret back to the server
      if (store && formData.consumer_secret === '********') {
        delete storeData.consumer_secret;
      }
      
      if (store) {
        storeData.id = store.id;
      }
      
      onSave(storeData);
    } catch (error) {
      console.error('Error saving store:', error);
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">סגור</span>
                  <HiTrash className="h-6 w-6" />
                </button>
              </div>
              
              {/* Content */}
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    שם החנות <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                    כתובת URL של החנות <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="url"
                    id="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://www.example.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="consumer_key" className="block text-sm font-medium text-gray-700 mb-1">
                    מפתח צרכן (Consumer Key) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="consumer_key"
                    id="consumer_key"
                    value={formData.consumer_key}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="consumer_secret" className="block text-sm font-medium text-gray-700 mb-1">
                    סוד צרכן (Consumer Secret) {!store && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="consumer_secret"
                    id="consumer_secret"
                    value={formData.consumer_secret}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required={!store} // Only required for new stores
                  />
                  {store && (
                    <p className="mt-1 text-sm text-gray-500">
                      השאר ריק כדי לשמור על הסוד הקיים
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    סטטוס
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">פעיל</option>
                    <option value="inactive">לא פעיל</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                disabled={saving}
              >
                {saving ? <Spinner size="sm" color="white" /> : null}
                {saving ? 'שומר...' : 'שמור'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
                disabled={saving}
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreModal;
