import React from 'react';
import { Button } from '../../../components/ui/button';
import { IntegrationFormData } from './types';

interface IntegrationFormProps {
  formData: IntegrationFormData;
  onChange: (formData: IntegrationFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  stores: { id: number; name: string }[];
  isEditing: boolean;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  stores,
  isEditing
}) => {
  const handleChange = (field: keyof IntegrationFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleCredentialChange = (key: string, value: string) => {
    onChange({
      ...formData,
      credentials: { ...formData.credentials, [key]: value }
    });
  };

  const handleSettingChange = (key: string, value: boolean) => {
    onChange({
      ...formData,
      settings: { ...formData.settings, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">חנות</label>
        <select
          value={formData.store_id}
          onChange={(e) => handleChange('store_id', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isEditing}
        >
          <option value="">בחר חנות</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>{store.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="שם החיבור"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as any)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="google-analytics">Google Analytics</option>
          <option value="facebook-ads">Facebook Ads</option>
          <option value="google-ads">Google Ads</option>
          <option value="google-search-console">Google Search Console</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">פרטי התחברות</label>
        <div className="bg-gray-50 p-4 rounded-md">
          {formData.type === 'google-analytics' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">מזהה מעקב</label>
                <input
                  type="text"
                  value={formData.credentials.tracking_id || ''}
                  onChange={(e) => handleCredentialChange('tracking_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UA-XXXXXXXXX-X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מפתח API</label>
                <input
                  type="password"
                  value={formData.credentials.api_key || ''}
                  onChange={(e) => handleCredentialChange('api_key', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="מפתח API"
                />
              </div>
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.include_demographics || false}
                    onChange={(e) => handleSettingChange('include_demographics', e.target.checked)}
                    className="ml-2"
                  />
                  <span className="text-sm text-gray-700">כלול נתונים דמוגרפיים</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.track_ecommerce || false}
                    onChange={(e) => handleSettingChange('track_ecommerce', e.target.checked)}
                    className="ml-2"
                  />
                  <span className="text-sm text-gray-700">עקוב אחר נתוני מסחר אלקטרוני</span>
                </label>
              </div>
            </>
          )}
          
          {formData.type === 'facebook-ads' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">מזהה אפליקציה</label>
                <input
                  type="text"
                  value={formData.credentials.app_id || ''}
                  onChange={(e) => handleCredentialChange('app_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="מזהה אפליקציה"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">סוד אפליקציה</label>
                <input
                  type="password"
                  value={formData.credentials.app_secret || ''}
                  onChange={(e) => handleCredentialChange('app_secret', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="סוד אפליקציה"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טוקן גישה</label>
                <input
                  type="password"
                  value={formData.credentials.access_token || ''}
                  onChange={(e) => handleCredentialChange('access_token', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="טוקן גישה"
                />
              </div>
            </>
          )}
          
          {formData.type === 'google-ads' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">מזהה לקוח</label>
                <input
                  type="text"
                  value={formData.credentials.client_id || ''}
                  onChange={(e) => handleCredentialChange('client_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="מזהה לקוח"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">סוד לקוח</label>
                <input
                  type="password"
                  value={formData.credentials.client_secret || ''}
                  onChange={(e) => handleCredentialChange('client_secret', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="סוד לקוח"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">טוקן רענון</label>
                <input
                  type="password"
                  value={formData.credentials.refresh_token || ''}
                  onChange={(e) => handleCredentialChange('refresh_token', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="טוקן רענון"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">טוקן מפתח</label>
                <input
                  type="password"
                  value={formData.credentials.developer_token || ''}
                  onChange={(e) => handleCredentialChange('developer_token', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="טוקן מפתח"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מזהה לקוח</label>
                <input
                  type="text"
                  value={formData.credentials.customer_id || ''}
                  onChange={(e) => handleCredentialChange('customer_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="מזהה לקוח (123-456-7890)"
                />
              </div>
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.include_campaigns || false}
                    onChange={(e) => handleSettingChange('include_campaigns', e.target.checked)}
                    className="ml-2"
                  />
                  <span className="text-sm text-gray-700">כלול נתוני קמפיינים</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.include_ad_groups || false}
                    onChange={(e) => handleSettingChange('include_ad_groups', e.target.checked)}
                    className="ml-2"
                  />
                  <span className="text-sm text-gray-700">כלול נתוני קבוצות מודעות</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.include_keywords || false}
                    onChange={(e) => handleSettingChange('include_keywords', e.target.checked)}
                    className="ml-2"
                  />
                  <span className="text-sm text-gray-700">כלול נתוני מילות מפתח</span>
                </label>
              </div>
            </>
          )}
          
          {formData.type === 'google-search-console' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">מזהה לקוח</label>
                <input
                  type="text"
                  value={formData.credentials.client_id || ''}
                  onChange={(e) => handleCredentialChange('client_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="מזהה לקוח"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">סוד לקוח</label>
                <input
                  type="password"
                  value={formData.credentials.client_secret || ''}
                  onChange={(e) => handleCredentialChange('client_secret', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="סוד לקוח"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טוקן רענון</label>
                <input
                  type="password"
                  value={formData.credentials.refresh_token || ''}
                  onChange={(e) => handleCredentialChange('refresh_token', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="טוקן רענון"
                />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת אתר</label>
                <input
                  type="text"
                  value={formData.credentials.site_url || ''}
                  onChange={(e) => handleCredentialChange('site_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_enabled}
            onChange={(e) => handleChange('is_enabled', e.target.checked)}
            className="ml-2"
          />
          <span className="text-sm text-gray-700">פעיל</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          ביטול
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!formData.name || !formData.store_id}
        >
          {isEditing ? 'עדכן' : 'הוסף'} חיבור
        </Button>
      </div>
    </div>
  );
};

export default IntegrationForm;
