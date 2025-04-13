import React, { useState, useEffect } from 'react';
import { HiOutlineExternalLink, HiOutlineInformationCircle } from 'react-icons/hi';
import { useStores } from '../../hooks/useStores';
import ElementorIntegrationForm from './ElementorIntegrationForm';
import ContactForm7IntegrationForm from './ContactForm7IntegrationForm';
import FacebookIntegrationForm from './FacebookIntegrationForm';
import CustomIntegrationForm from './CustomIntegrationForm';
import GoogleAnalyticsIntegrationForm from './GoogleAnalyticsIntegrationForm';
import GoogleAdsIntegrationForm from './GoogleAdsIntegrationForm';
import FacebookAdsIntegrationForm from './FacebookAdsIntegrationForm';
import GoogleSearchConsoleIntegrationForm from './GoogleSearchConsoleIntegrationForm';
import MultiSupplierManagerIntegrationForm from './MultiSupplierManagerIntegrationForm';
import ConfirmDialog from '../ConfirmDialog';
import Spinner from '../Spinner';
import { Integration, CategoryItem } from './integrations/modules';
import LeadIntegrations from './integrations/LeadIntegrations';
import AnalyticsIntegrations from './integrations/AnalyticsIntegrations';
import InventoryIntegrations from './integrations/InventoryIntegrations';

// Import API service
import { integrationSettingsAPI } from '../../services/api';

const IntegrationsTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<
    'elementor' | 
    'contact-form-7' | 
    'facebook' | 
    'custom' | 
    'google-analytics' | 
    'google-ads' | 
    'facebook-ads' | 
    'google-search-console' | 
    'multi-supplier-manager' |
    null
  >(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null);
  
  const { stores } = useStores();
  
  const categories: CategoryItem[] = [
    { id: 'all', name: 'הכל', count: integrations.length },
    { id: 'leads', name: 'לידים', count: integrations.filter(i => ['elementor', 'contact-form-7'].includes(i.type)).length },
    { id: 'notifications', name: 'התראות', count: 0 },
    { id: 'payments', name: 'תשלומים', count: 0 },
    { 
      id: 'analytics', 
      name: 'שירותי אנליטיקה', 
      count: integrations.filter(i => ['google-analytics', 'google-ads', 'facebook-ads', 'google-search-console'].includes(i.type)).length 
    },
    {
      id: 'inventory',
      name: 'מלאי וספקים',
      count: integrations.filter(i => ['multi-supplier-manager'].includes(i.type)).length
    }
  ];
  
  useEffect(() => {
    fetchIntegrations();
  }, []);
  
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to fetch integrations from API...');
      
      // Call the real API
      const response = await integrationSettingsAPI.getAll();
      
      console.log('API response for getAll:', response);
      
      if (response.success && response.data) {
        console.log('Successfully fetched integrations:', response.data);
        setIntegrations(response.data);
      } else {
        // If API returns success: false, show the error message
        console.error('API returned success: false:', response.message);
        setError(response.message || 'שגיאה בטעינת האינטגרציות');
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('שגיאה בטעינת האינטגרציות');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateIntegration = (type: 
    'elementor' | 
    'contact-form-7' | 
    'facebook' | 
    'custom' | 
    'google-analytics' | 
    'google-ads' | 
    'facebook-ads' | 
    'google-search-console' |
    'multi-supplier-manager'
  ) => {
    setModalType(type);
    setEditingIntegration(null);
    setShowModal(true);
  };
  
  const handleEditIntegration = (integration: Integration) => {
    // Set modalType for all supported types
    if ([
      'elementor', 
      'contact-form-7', 
      'facebook', 
      'custom',
      'google-analytics',
      'google-ads',
      'facebook-ads',
      'google-search-console',
      'multi-supplier-manager'
    ].includes(integration.type)) {
      setModalType(integration.type as any);
      setEditingIntegration(integration);
      setShowModal(true);
    }
  };
  
  const handleDeleteIntegration = (integration: Integration) => {
    setIntegrationToDelete(integration);
    setShowConfirmDialog(true);
  };
  
  const confirmDeleteIntegration = async () => {
    if (!integrationToDelete) return;
    
    console.log('Attempting to delete integration:', integrationToDelete);
    
    try {
      // Call the real API
      console.log('Calling API to delete integration with ID:', integrationToDelete.id);
      
      // Log the API endpoint being called
      console.log('API endpoint:', `${import.meta.env.VITE_API_URL || 'https://crm-d30s.onrender.com/api'}/leads/integrations/${integrationToDelete.id}`);
      
      // Log the request headers
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });
      
      const response = await integrationSettingsAPI.delete(integrationToDelete.id);
      
      console.log('API response for delete:', response);
      
      if (response.success) {
        console.log('Successfully deleted integration');
        // Update the state with the filtered integrations
        setIntegrations(integrations.filter(i => i.id !== integrationToDelete.id));
        setShowConfirmDialog(false);
        setIntegrationToDelete(null);
        
        // Force a re-fetch of integrations to ensure we have the latest data
        setTimeout(() => {
          console.log('Re-fetching integrations after delete');
          fetchIntegrations();
        }, 500);
      } else {
        // If API returns success: false, show the error message
        console.error('API returned success: false for delete:', response.message);
        setError(response.message || 'שגיאה במחיקת האינטגרציה');
      }
    } catch (err) {
      console.error('Error deleting integration:', err);
      setError('שגיאה במחיקת האינטגרציה');
    }
  };
  
  const handleSaveIntegration = async (data: any) => {
    console.log('handleSaveIntegration called with data:', data);
    
    try {
      if (editingIntegration) {
        // Update existing integration
        console.log('Updating existing integration with ID:', editingIntegration.id);
        const response = await integrationSettingsAPI.update(editingIntegration.id, data);
        
        console.log('API response for update:', response);
        
        if (response.success && response.data) {
          console.log('Successfully updated integration');
          // Update the state with the updated integration
          setIntegrations(integrations.map(i => 
            i.id === editingIntegration.id ? response.data : i
          ));
          
          setShowModal(false);
          setEditingIntegration(null);
          setModalType(null);
        } else {
          // If API returns success: false, show the error message
          console.error('API returned success: false for update:', response.message);
          setError(response.message || 'שגיאה בעדכון האינטגרציה');
        }
      } else {
        // Create new integration
        console.log('Creating new integration');
        const response = await integrationSettingsAPI.create(data);
        
        console.log('API response for create:', response);
        
        if (response.success && response.data) {
          console.log('Successfully created integration:', response.data);
          // Update the state with the new integration
          setIntegrations([...integrations, response.data]);
          
          setShowModal(false);
          setEditingIntegration(null);
          setModalType(null);
        } else {
          // If API returns success: false, show the error message
          console.error('API returned success: false for create:', response.message);
          setError(response.message || 'שגיאה ביצירת האינטגרציה');
        }
      }
    } catch (err: any) {
      console.error('Error saving integration:', err);
      
      // Check for foreign key constraint error
      if (err.response?.data?.error && err.response.data.error.includes('foreign key constraint')) {
        if (err.response.data.error.includes('fk_integration_store')) {
          // Store ID foreign key constraint error
          alert('החנות שנבחרה אינה קיימת במערכת. האינטגרציה תישמר ללא שיוך לחנות ספציפית.');
          
          // Remove store_id and try again
          const newData = { ...data };
          delete newData.store_id;
          
          // Call the function recursively with the modified data
          handleSaveIntegration(newData);
          return;
        }
      }
      
      setError('שגיאה בשמירת האינטגרציה');
    }
  };
  
  const handleCancelIntegration = () => {
    setShowModal(false);
    setEditingIntegration(null);
    setModalType(null);
  };
  
  const handleToggleIntegration = async (integration: Integration) => {
    console.log('handleToggleIntegration called with integration:', integration);
    
    try {
      // Call the real API
      console.log('Calling API to toggle integration with ID:', integration.id, 'to', !integration.is_enabled);
      const response = await integrationSettingsAPI.update(integration.id, { 
        is_enabled: !integration.is_enabled 
      });
      
      console.log('API response for toggle:', response);
      
      if (response.success && response.data) {
        console.log('Successfully toggled integration');
        // Update the state with the updated integration
        setIntegrations(integrations.map(i => 
          i.id === integration.id ? response.data : i
        ));
      } else {
        // If API returns success: false, show the error message
        console.error('API returned success: false for toggle:', response.message);
        setError(response.message || 'שגיאה בעדכון האינטגרציה');
      }
    } catch (err) {
      console.error('Error toggling integration:', err);
      setError('שגיאה בעדכון האינטגרציה');
    }
  };
  
  const renderIntegrationModal = () => {
    if (!showModal) return null;
    
    switch (modalType) {
      case 'elementor':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <ElementorIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'contact-form-7':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <ContactForm7IntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'facebook':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <FacebookIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CustomIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'google-analytics':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <GoogleAnalyticsIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'google-ads':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <GoogleAdsIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'facebook-ads':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <FacebookAdsIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'google-search-console':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <GoogleSearchConsoleIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      case 'multi-supplier-manager':
        return (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <MultiSupplierManagerIntegrationForm 
                onSave={handleSaveIntegration}
                onCancel={handleCancelIntegration}
                initialData={editingIntegration}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">אינטגרציות</h2>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="inline-flex items-center p-1.5 border border-transparent text-sm font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors duration-200 ml-2"
            title="מידע"
          >
            <HiOutlineInformationCircle className="h-5 w-5" />
          </button>
          <a
            href="https://docs.example.com/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors duration-200"
          >
            תיעוד <HiOutlineExternalLink className="mr-1 h-4 w-4" />
          </a>
        </div>
      </div>
      
      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            אינטגרציות מאפשרות לך לחבר את המערכת לשירותים חיצוניים כמו טפסים, מערכות אנליטיקה, ועוד.
            כל אינטגרציה יכולה להיות מוגדרת לחנות ספציפית או לכל החנויות.
          </p>
        </div>
      )}
      
      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeCategory === category.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {category.name}
              {category.count > 0 && (
                <span className={`mr-2 py-0.5 px-2 rounded-full text-xs ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchIntegrations}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none transition-colors duration-200"
            >
              נסה שוב
            </button>
          </div>
        ) : (
          <>
            {/* Lead Integrations */}
            {(activeCategory === 'all' || activeCategory === 'leads') && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">אינטגרציות לידים</h3>
                <LeadIntegrations 
                  integrations={integrations}
                  loading={loading}
                  stores={stores || []}
                  onCreateIntegration={handleCreateIntegration}
                  onEditIntegration={handleEditIntegration}
                  onDeleteIntegration={handleDeleteIntegration}
                  onToggleIntegration={handleToggleIntegration}
                />
              </div>
            )}
            
            {/* Analytics Integrations */}
            {(activeCategory === 'all' || activeCategory === 'analytics') && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">שירותי אנליטיקה</h3>
                <AnalyticsIntegrations 
                  integrations={integrations}
                  loading={loading}
                  stores={stores || []}
                  onCreateIntegration={handleCreateIntegration}
                  onEditIntegration={handleEditIntegration}
                  onDeleteIntegration={handleDeleteIntegration}
                  onToggleIntegration={handleToggleIntegration}
                />
              </div>
            )}
            
            {/* Notifications Integrations */}
            {(activeCategory === 'all' || activeCategory === 'notifications') && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">אינטגרציות התראות</h3>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
                  <p className="text-gray-500">אין אינטגרציות התראות מוגדרות</p>
                  <p className="text-sm text-gray-400 mt-2">אינטגרציות התראות יהיו זמינות בקרוב</p>
                </div>
              </div>
            )}
            
            {/* Payments Integrations */}
            {(activeCategory === 'all' || activeCategory === 'payments') && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">אינטגרציות תשלומים</h3>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
                  <p className="text-gray-500">אין אינטגרציות תשלומים מוגדרות</p>
                  <p className="text-sm text-gray-400 mt-2">אינטגרציות תשלומים יהיו זמינות בקרוב</p>
                </div>
              </div>
            )}
            
            {/* Inventory & Suppliers Integrations */}
            {(activeCategory === 'all' || activeCategory === 'inventory') && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מלאי וספקים</h3>
                <InventoryIntegrations 
                  integrations={integrations}
                  loading={loading}
                  stores={stores || []}
                  onCreateIntegration={handleCreateIntegration}
                  onEditIntegration={handleEditIntegration}
                  onDeleteIntegration={handleDeleteIntegration}
                  onToggleIntegration={handleToggleIntegration}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modals */}
      {renderIntegrationModal()}
      
      {/* Confirm Dialog */}
      {integrationToDelete && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="מחיקת אינטגרציה"
          message={`האם אתה בטוח שברצונך למחוק את האינטגרציה "${integrationToDelete.name}"?`}
          confirmText="מחק"
          cancelText="ביטול"
          onConfirm={confirmDeleteIntegration}
          onCancel={() => {
            setShowConfirmDialog(false);
            setIntegrationToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default IntegrationsTab;
