import React, { useState, useEffect } from 'react';
import { useStores } from '../../../hooks/useStores';
import { useToast } from '../../../hooks/useToast';
import { HiPlus } from 'react-icons/hi';
import Spinner from '../../Spinner';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import IntegrationCard from './IntegrationCard';
import IntegrationForm from './IntegrationForm';
import { AnalyticsIntegration, IntegrationFormData } from './types';
import { generateMockIntegrations } from './IntegrationUtils';

const AnalyticsIntegrations: React.FC = () => {
  const { stores, loading: storesLoading } = useStores();
  const { showToast } = useToast();
  
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [integrations, setIntegrations] = useState<AnalyticsIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<AnalyticsIntegration | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState<IntegrationFormData>({
    store_id: 0,
    name: '',
    type: 'google-analytics',
    credentials: {},
    settings: {},
    is_enabled: true
  });
  
  // Load integrations when store changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchIntegrations();
    } else {
      setIntegrations([]);
    }
  }, [selectedStoreId]);
  
  // Set first store as default when stores load
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
      setFormData(prev => ({ ...prev, store_id: stores[0].id }));
    }
  }, [stores]);
  
  // Fetch integrations for the selected store
  const fetchIntegrations = async () => {
    if (!selectedStoreId) return;
    
    setLoading(true);
    try {
      // This would be a real API call in a production environment
      // For now, we'll use mock data
      setTimeout(() => {
        const mockIntegrations = generateMockIntegrations(selectedStoreId);
        setIntegrations(mockIntegrations);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      showToast('error', 'אירעה שגיאה בטעינת החיבורים');
      setLoading(false);
    }
  };
  
  // Sync an integration
  const handleSync = async (integrationId: number) => {
    setSyncing(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      // This would be a real API call in a production environment
      // For now, we'll use a timeout to simulate the API call
      setTimeout(() => {
        showToast('success', 'סנכרון הנתונים החל, זה עשוי לקחת מספר דקות');
        
        setSyncing(prev => ({ ...prev, [integrationId]: false }));
        
        // Update the integration's last_sync
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === integrationId 
              ? {
                  ...integration,
                  last_sync: {
                    status: 'completed',
                    start_time: new Date().toISOString(),
                    end_time: new Date().toISOString(),
                    records_processed: Math.floor(Math.random() * 100) + 50
                  }
                }
              : integration
          )
        );
      }, 2000);
    } catch (error) {
      console.error('Error syncing integration:', error);
      showToast('error', 'אירעה שגיאה בסנכרון החיבור');
      setSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };
  
  // Toggle integration enabled/disabled
  const handleToggleEnabled = async (integrationId: number, currentStatus: boolean) => {
    try {
      // This would be a real API call in a production environment
      // For now, we'll update the state directly
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, is_enabled: !currentStatus }
            : integration
        )
      );
      
      showToast('success', `החיבור ${currentStatus ? 'הושבת' : 'הופעל'} בהצלחה`);
    } catch (error) {
      console.error('Error toggling integration:', error);
      showToast('error', 'אירעה שגיאה בעדכון החיבור');
    }
  };
  
  // Delete an integration
  const handleDelete = async (integrationId: number) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק חיבור זה?')) {
      return;
    }
    
    try {
      // This would be a real API call in a production environment
      // For now, we'll update the state directly
      setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
      
      showToast('success', 'החיבור נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting integration:', error);
      showToast('error', 'אירעה שגיאה במחיקת החיבור');
    }
  };
  
  // Edit an integration
  const handleEdit = (integration: AnalyticsIntegration) => {
    setEditingIntegration(integration);
    setFormData({
      store_id: integration.store_id,
      name: integration.name,
      type: integration.type,
      credentials: integration.credentials,
      settings: integration.settings || {},
      is_enabled: integration.is_enabled
    });
    setIsModalOpen(true);
  };
  
  // Submit form
  const handleSubmitForm = async () => {
    try {
      // This would be a real API call in a production environment
      // For now, we'll update the state directly
      if (editingIntegration) {
        // Update existing integration
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === editingIntegration.id 
              ? { 
                  ...integration, 
                  ...formData,
                  updated_at: new Date().toISOString()
                }
              : integration
          )
        );
        
        showToast('success', 'החיבור עודכן בהצלחה');
      } else {
        // Create new integration
        const newIntegration: AnalyticsIntegration = {
          id: Math.max(0, ...integrations.map(i => i.id)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setIntegrations(prev => [...prev, newIntegration]);
        
        showToast('success', 'החיבור נוסף בהצלחה');
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
      setEditingIntegration(null);
      setFormData({
        store_id: selectedStoreId || 0,
        name: '',
        type: 'google-analytics',
        credentials: {},
        settings: {},
        is_enabled: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('error', 'אירעה שגיאה בשמירת החיבור');
    }
  };
  
  // Filter integrations by type
  const filteredIntegrations = activeTab === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.type === activeTab);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">חיבורים לאנליטיקה חיצונית</h2>
            <p className="text-gray-600">נהל את החיבורים לפלטפורמות אנליטיקה חיצוניות</p>
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            <select
              value={selectedStoreId || ''}
              onChange={(e) => setSelectedStoreId(e.target.value ? parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={storesLoading}
            >
              {storesLoading ? (
                <option value="">טוען חנויות...</option>
              ) : (
                <>
                  <option value="">בחר חנות</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </>
              )}
            </select>
            
            <Button
              onClick={() => {
                setEditingIntegration(null);
                setFormData({
                  store_id: selectedStoreId || 0,
                  name: '',
                  type: 'google-analytics',
                  credentials: {},
                  settings: {},
                  is_enabled: true
                });
                setIsModalOpen(true);
              }}
              disabled={!selectedStoreId}
              className="flex items-center"
            >
              <HiPlus className="ml-1" />
              הוסף חיבור
            </Button>
          </div>
        </div>
        
        {!selectedStoreId ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">בחר חנות כדי להציג את החיבורים לאנליטיקה</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : integrations.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">אין חיבורים לאנליטיקה עבור חנות זו</p>
            <p className="text-gray-400 mt-2">לחץ על "הוסף חיבור" כדי להתחיל</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue={activeTab} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="all" onClick={() => setActiveTab('all')}>הכל</TabsTrigger>
                <TabsTrigger value="google-analytics" onClick={() => setActiveTab('google-analytics')}>Google Analytics</TabsTrigger>
                <TabsTrigger value="facebook-ads" onClick={() => setActiveTab('facebook-ads')}>Facebook Ads</TabsTrigger>
                <TabsTrigger value="google-ads" onClick={() => setActiveTab('google-ads')}>Google Ads</TabsTrigger>
                <TabsTrigger value="google-search-console" onClick={() => setActiveTab('google-search-console')}>Search Console</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntegrations.map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onSync={handleSync}
                      onToggleEnabled={handleToggleEnabled}
                      syncing={syncing[integration.id] || false}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      {/* Integration Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingIntegration ? 'ערוך חיבור' : 'הוסף חיבור חדש'}
              </h3>
            </div>
            
            <div className="p-6">
              <IntegrationForm
                formData={formData}
                onChange={setFormData}
                onSubmit={handleSubmitForm}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingIntegration(null);
                }}
                stores={stores}
                isEditing={!!editingIntegration}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsIntegrations;
