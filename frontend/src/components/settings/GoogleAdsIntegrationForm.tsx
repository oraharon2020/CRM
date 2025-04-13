import React, { useState, useEffect } from 'react';
import { HiX, HiInformationCircle } from 'react-icons/hi';
import { useStores } from '../../hooks/useStores';
import Spinner from '../Spinner';

interface GoogleAdsIntegrationFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const GoogleAdsIntegrationForm: React.FC<GoogleAdsIntegrationFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const { stores, loading: storesLoading } = useStores();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || 'חיבור Google Ads',
    type: 'google-ads',
    is_enabled: initialData?.is_enabled ?? true,
    store_id: initialData?.store_id || null,
    client_id: initialData?.client_id || '',
    client_secret: initialData?.client_secret || '',
    developer_token: initialData?.developer_token || '',
    refresh_token: initialData?.refresh_token || '',
    customer_id: initialData?.customer_id || '',
    manager_id: initialData?.manager_id || '',
    login_customer_id: initialData?.login_customer_id || ''
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
    
    if (!formData.client_id.trim()) {
      newErrors.client_id = 'מזהה הלקוח הוא שדה חובה';
    }
    
    if (!formData.client_secret.trim()) {
      newErrors.client_secret = 'סוד הלקוח הוא שדה חובה';
    }
    
    if (!formData.developer_token.trim()) {
      newErrors.developer_token = 'טוקן המפתח הוא שדה חובה';
    }
    
    if (!formData.refresh_token.trim()) {
      newErrors.refresh_token = 'טוקן הרענון הוא שדה חובה';
    }
    
    if (!formData.customer_id.trim()) {
      newErrors.customer_id = 'מזהה הלקוח של Google Ads הוא שדה חובה';
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
      <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {initialData ? 'עריכת חיבור Google Ads' : 'חיבור חדש ל-Google Ads'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-white hover:text-red-200 transition-colors duration-200"
        >
          <HiX className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiInformationCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="mr-3">
              <p className="text-sm text-red-800">
                חיבור זה מאפשר לך לראות נתוני קמפיינים מ-Google Ads ישירות במערכת.
                תצטרך ליצור פרויקט ב-Google Cloud Platform ולהגדיר את ה-OAuth 2.0 עבור Google Ads API.
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
                    className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
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
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                <div className="flex items-center h-5 mt-6">
                  <input
                    id="is_enabled"
                    name="is_enabled"
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={handleChange}
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                  />
                  <label htmlFor="is_enabled" className="mr-2 block text-sm text-gray-700">
                    הפעל חיבור זה
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* OAuth Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות OAuth</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                  מזהה לקוח (Client ID)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="client_id"
                    id="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.client_id ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.client_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="client_secret" className="block text-sm font-medium text-gray-700">
                  סוד לקוח (Client Secret)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="client_secret"
                    id="client_secret"
                    value={formData.client_secret}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.client_secret ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.client_secret && (
                    <p className="mt-1 text-sm text-red-600">{errors.client_secret}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="developer_token" className="block text-sm font-medium text-gray-700">
                  טוקן מפתח (Developer Token)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="developer_token"
                    id="developer_token"
                    value={formData.developer_token}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.developer_token ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.developer_token && (
                    <p className="mt-1 text-sm text-red-600">{errors.developer_token}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="refresh_token" className="block text-sm font-medium text-gray-700">
                  טוקן רענון (Refresh Token)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="refresh_token"
                    id="refresh_token"
                    value={formData.refresh_token}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.refresh_token ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.refresh_token && (
                    <p className="mt-1 text-sm text-red-600">{errors.refresh_token}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות חשבון Google Ads</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                  מזהה לקוח (Customer ID)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="customer_id"
                    id="customer_id"
                    placeholder="123-456-7890"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.customer_id ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.customer_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    מזהה הלקוח של Google Ads בפורמט XXX-XXX-XXXX
                  </p>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700">
                  מזהה מנהל (Manager ID) - אופציונלי
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="manager_id"
                    id="manager_id"
                    placeholder="123-456-7890"
                    value={formData.manager_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    אם אתה משתמש בחשבון מנהל, הזן את מזהה המנהל כאן
                  </p>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="login_customer_id" className="block text-sm font-medium text-gray-700">
                  מזהה לקוח להתחברות (Login Customer ID) - אופציונלי
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="login_customer_id"
                    id="login_customer_id"
                    placeholder="123-456-7890"
                    value={formData.login_customer_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    נדרש רק אם אתה משתמש בחשבון מנהל ומתחבר דרך חשבון לקוח ספציפי
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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

export default GoogleAdsIntegrationForm;
