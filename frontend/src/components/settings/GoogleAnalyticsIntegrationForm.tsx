import React, { useState, useEffect } from 'react';
import { HiX, HiInformationCircle } from 'react-icons/hi';
import { useStores } from '../../hooks/useStores';
import Spinner from '../Spinner';

interface GoogleAnalyticsIntegrationFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const GoogleAnalyticsIntegrationForm: React.FC<GoogleAnalyticsIntegrationFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const { stores, loading: storesLoading } = useStores();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || 'חיבור Google Analytics',
    type: 'google-analytics',
    is_enabled: initialData?.is_enabled ?? true,
    store_id: initialData?.store_id || null,
    view_id: initialData?.view_id || '',
    property_id: initialData?.property_id || '',
    client_email: initialData?.client_email || '',
    private_key: initialData?.private_key || '',
    tracking_id: initialData?.tracking_id || '',
    measurement_id: initialData?.measurement_id || '',
    api_secret: initialData?.api_secret || '',
    analytics_version: initialData?.analytics_version || 'ga4'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'store_id') {
      setFormData(prev => ({ ...prev, [name]: value === 'null' ? null : parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'שם החיבור הוא שדה חובה';
    }
    
    if (formData.analytics_version === 'ga4') {
      if (!formData.measurement_id.trim()) {
        newErrors.measurement_id = 'מזהה המדידה הוא שדה חובה';
      }
      
      if (!formData.api_secret.trim()) {
        newErrors.api_secret = 'סוד ה-API הוא שדה חובה';
      }
    } else {
      if (!formData.tracking_id.trim()) {
        newErrors.tracking_id = 'מזהה המעקב הוא שדה חובה';
      }
      
      if (!formData.view_id.trim()) {
        newErrors.view_id = 'מזהה התצוגה הוא שדה חובה';
      }
    }
    
    if (!formData.client_email.trim()) {
      newErrors.client_email = 'דוא"ל שירות הוא שדה חובה';
    }
    
    if (!formData.private_key.trim()) {
      newErrors.private_key = 'מפתח פרטי הוא שדה חובה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      onSave(formData);
    } catch (error) {
      console.error('Error saving integration:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {initialData ? 'עריכת חיבור Google Analytics' : 'חיבור חדש ל-Google Analytics'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-white hover:text-blue-200 transition-colors duration-200"
        >
          <HiX className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiInformationCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mr-3">
              <p className="text-sm text-blue-800">
                חיבור זה מאפשר לך לראות נתוני אנליטיקה מ-Google Analytics ישירות במערכת. 
                תצטרך ליצור חשבון שירות ב-Google Cloud Platform ולהעניק לו הרשאות מתאימות.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">מידע בסיסי</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  שם החיבור
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="store_id" className="block text-sm font-medium text-gray-700">
                  חנות
                </label>
                <div className="mt-1">
                  <select
                    id="store_id"
                    name="store_id"
                    value={formData.store_id === null ? 'null' : formData.store_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="null">כל החנויות</option>
                    {storesLoading ? (
                      <option disabled>טוען חנויות...</option>
                    ) : (
                      stores?.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="analytics_version" className="block text-sm font-medium text-gray-700">
                  גרסת Google Analytics
                </label>
                <div className="mt-1">
                  <select
                    id="analytics_version"
                    name="analytics_version"
                    value={formData.analytics_version}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="ga4">Google Analytics 4 (GA4)</option>
                    <option value="ua">Universal Analytics (UA)</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <div className="flex items-center h-5 mt-6">
                  <input
                    id="is_enabled"
                    name="is_enabled"
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="is_enabled" className="mr-2 block text-sm text-gray-700">
                    הפעל חיבור זה
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Google Analytics 4 Settings */}
          {formData.analytics_version === 'ga4' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות Google Analytics 4</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="measurement_id" className="block text-sm font-medium text-gray-700">
                    מזהה מדידה (Measurement ID)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="measurement_id"
                      id="measurement_id"
                      placeholder="G-XXXXXXXXXX"
                      value={formData.measurement_id}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.measurement_id ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.measurement_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.measurement_id}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="api_secret" className="block text-sm font-medium text-gray-700">
                    סוד API (API Secret)
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="api_secret"
                      id="api_secret"
                      value={formData.api_secret}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.api_secret ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.api_secret && (
                      <p className="mt-1 text-sm text-red-600">{errors.api_secret}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                    מזהה נכס (Property ID)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="property_id"
                      id="property_id"
                      placeholder="123456789"
                      value={formData.property_id}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Universal Analytics Settings */}
          {formData.analytics_version === 'ua' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות Universal Analytics</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="tracking_id" className="block text-sm font-medium text-gray-700">
                    מזהה מעקב (Tracking ID)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="tracking_id"
                      id="tracking_id"
                      placeholder="UA-XXXXXXXXX-X"
                      value={formData.tracking_id}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.tracking_id ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.tracking_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.tracking_id}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="view_id" className="block text-sm font-medium text-gray-700">
                    מזהה תצוגה (View ID)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="view_id"
                      id="view_id"
                      placeholder="123456789"
                      value={formData.view_id}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.view_id ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.view_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.view_id}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Service Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות חשבון שירות</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="client_email" className="block text-sm font-medium text-gray-700">
                  דוא"ל שירות (Service Account Email)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="client_email"
                    id="client_email"
                    placeholder="example@project-id.iam.gserviceaccount.com"
                    value={formData.client_email}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.client_email ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.client_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.client_email}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="private_key" className="block text-sm font-medium text-gray-700">
                  מפתח פרטי (Private Key)
                </label>
                <div className="mt-1">
                  <textarea
                    name="private_key"
                    id="private_key"
                    rows={4}
                    placeholder="-----BEGIN PRIVATE KEY-----\nXXXXX...\n-----END PRIVATE KEY-----\n"
                    value={formData.private_key}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.private_key ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.private_key && (
                    <p className="mt-1 text-sm text-red-600">{errors.private_key}</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  העתק את המפתח הפרטי המלא מקובץ ה-JSON של חשבון השירות שלך, כולל שורות ה-BEGIN ו-END.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="ml-2" />
                שומר...
              </>
            ) : (
              'שמור'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoogleAnalyticsIntegrationForm;
