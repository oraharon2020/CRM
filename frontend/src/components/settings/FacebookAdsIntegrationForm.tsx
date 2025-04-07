import React, { useState, useEffect } from 'react';
import { HiX, HiInformationCircle } from 'react-icons/hi';
import { useStores } from '../../hooks/useStores';
import Spinner from '../Spinner';

interface FacebookAdsIntegrationFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const FacebookAdsIntegrationForm: React.FC<FacebookAdsIntegrationFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const { stores, loading: storesLoading } = useStores();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || 'חיבור Facebook Ads',
    type: 'facebook-ads',
    is_enabled: initialData?.is_enabled ?? true,
    store_id: initialData?.store_id || null,
    app_id: initialData?.app_id || '',
    app_secret: initialData?.app_secret || '',
    access_token: initialData?.access_token || '',
    ad_account_id: initialData?.ad_account_id || '',
    pixel_id: initialData?.pixel_id || ''
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
    
    if (!formData.app_id.trim()) {
      newErrors.app_id = 'מזהה האפליקציה הוא שדה חובה';
    }
    
    if (!formData.app_secret.trim()) {
      newErrors.app_secret = 'סוד האפליקציה הוא שדה חובה';
    }
    
    if (!formData.access_token.trim()) {
      newErrors.access_token = 'טוקן הגישה הוא שדה חובה';
    }
    
    if (!formData.ad_account_id.trim()) {
      newErrors.ad_account_id = 'מזהה חשבון המודעות הוא שדה חובה';
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
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {initialData ? 'עריכת חיבור Facebook Ads' : 'חיבור חדש ל-Facebook Ads'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-white hover:text-indigo-200 transition-colors duration-200"
        >
          <HiX className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="bg-indigo-50 border-r-4 border-indigo-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiInformationCircle className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mr-3">
              <p className="text-sm text-indigo-800">
                חיבור זה מאפשר לך לראות נתוני קמפיינים מ-Facebook Ads ישירות במערכת.
                תצטרך ליצור אפליקציה ב-Facebook Developers ולהגדיר את ההרשאות המתאימות.
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
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
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
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="is_enabled" className="mr-2 block text-sm text-gray-700">
                    הפעל חיבור זה
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Facebook App Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות אפליקציית Facebook</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="app_id" className="block text-sm font-medium text-gray-700">
                  מזהה אפליקציה (App ID)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="app_id"
                    id="app_id"
                    value={formData.app_id}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.app_id ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.app_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.app_id}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="app_secret" className="block text-sm font-medium text-gray-700">
                  סוד אפליקציה (App Secret)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="app_secret"
                    id="app_secret"
                    value={formData.app_secret}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.app_secret ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.app_secret && (
                    <p className="mt-1 text-sm text-red-600">{errors.app_secret}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="access_token" className="block text-sm font-medium text-gray-700">
                  טוקן גישה (Access Token)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="access_token"
                    id="access_token"
                    value={formData.access_token}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.access_token ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.access_token && (
                    <p className="mt-1 text-sm text-red-600">{errors.access_token}</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  השתמש בטוקן גישה לטווח ארוך (Long-lived Access Token) עם הרשאות לקריאת נתוני מודעות
                </p>
              </div>
            </div>
          </div>
          
          {/* Ad Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות חשבון מודעות</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="ad_account_id" className="block text-sm font-medium text-gray-700">
                  מזהה חשבון מודעות (Ad Account ID)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="ad_account_id"
                    id="ad_account_id"
                    placeholder="act_123456789"
                    value={formData.ad_account_id}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.ad_account_id ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.ad_account_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.ad_account_id}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    מזהה חשבון המודעות בפורמט act_XXXXXXXXX
                  </p>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="pixel_id" className="block text-sm font-medium text-gray-700">
                  מזהה פיקסל (Pixel ID) - אופציונלי
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="pixel_id"
                    id="pixel_id"
                    placeholder="123456789"
                    value={formData.pixel_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    אם ברצונך לעקוב אחר המרות, הזן את מזהה הפיקסל של Facebook
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
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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

export default FacebookAdsIntegrationForm;
