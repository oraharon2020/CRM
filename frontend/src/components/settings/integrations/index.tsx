import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiOutlineExternalLink } from 'react-icons/hi';
import { useStores } from '../../../hooks/useStores';
import { Integration, IntegrationType, Category } from './types';
import CategoryTabs from './CategoryTabs';
import IntegrationList from './IntegrationList';
import IntegrationModal from './IntegrationModal';
import InstallationInstructions from './InstallationInstructions';
import ConfirmDialog from '../../ConfirmDialog';
import Spinner from '../../Spinner';
import { getMockIntegrationsData, createMockIntegration } from './IntegrationUtils';

// In a real app, we would import the API service
// import { integrationSettingsAPI } from '../../../services/api';

const IntegrationsTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<IntegrationType | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null);
  
  const { stores } = useStores();
  
  const getCategories = (): Category[] => {
    return [
      { id: 'all', name: 'הכל', count: integrations.length },
      { id: 'leads', name: 'לידים', count: integrations.filter(i => ['elementor', 'contact-form-7', 'facebook', 'custom'].includes(i.type)).length },
      { id: 'notifications', name: 'התראות', count: 0 },
      { id: 'payments', name: 'תשלומים', count: 0 },
      { id: 'analytics', name: 'אנליטיקה', count: integrations.filter(i => ['google-analytics', 'google-ads', 'facebook-ads', 'google-search-console'].includes(i.type)).length }
    ];
  };
  
  useEffect(() => {
    fetchIntegrations();
  }, []);
  
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, we would call the API
      // For now, we'll simulate the API call
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This is how we would call the real API
      // const response = await integrationSettingsAPI.getAll();
      // const integrationsData = response.data;
      
      // For now, simulate the response
      const integrationsData = getMockIntegrationsData();
      
      setIntegrations(integrationsData);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('שגיאה בטעינת האינטגרציות');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateIntegration = (type: IntegrationType) => {
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
      'google-search-console'
    ].includes(integration.type)) {
      setModalType(integration.type as IntegrationType);
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
    
    try {
      // In a real app, we would call the API
      // await integrationSettingsAPI.delete(integrationToDelete.id);
      
      // For now, just update the state
      setIntegrations(integrations.filter(i => i.id !== integrationToDelete.id));
      
      setShowConfirmDialog(false);
      setIntegrationToDelete(null);
    } catch (err) {
      console.error('Error deleting integration:', err);
      setError('שגיאה במחיקת האינטגרציה');
    }
  };
  
  const handleSaveIntegration = async (data: any) => {
    try {
      if (editingIntegration) {
        // Update existing integration
        // In a real app, we would call the API
        // await integrationSettingsAPI.update(editingIntegration.id, data);
        
        // For now, just update the state
        setIntegrations(integrations.map(i => 
          i.id === editingIntegration.id ? { ...i, ...data } : i
        ));
      } else {
        // Create new integration
        // In a real app, we would call the API
        // const response = await integrationSettingsAPI.create(data);
        // const newIntegration = response.data;
        
        // For now, just update the state with a mock response
        const newIntegration = createMockIntegration(data, integrations);
        
        setIntegrations([...integrations, newIntegration]);
      }
      
      setShowModal(false);
      setEditingIntegration(null);
      setModalType(null);
    } catch (err) {
      console.error('Error saving integration:', err);
      setError('שגיאה בשמירת האינטגרציה');
    }
  };
  
  const handleCancelIntegration = () => {
    setShowModal(false);
    setEditingIntegration(null);
    setModalType(null);
  };
  
  const handleToggleIntegration = async (integration: Integration) => {
    try {
      const updatedIntegration = { ...integration, is_enabled: !integration.is_enabled };
      
      // In a real app, we would call the API
      // await integrationSettingsAPI.update(integration.id, { is_enabled: !integration.is_enabled });
      
      // For now, just update the state
      setIntegrations(integrations.map(i => 
        i.id === integration.id ? updatedIntegration : i
      ));
    } catch (err) {
      console.error('Error toggling integration:', err);
      setError('שגיאה בעדכון האינטגרציה');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">חיבורים</h2>
        <button
          onClick={() => handleCreateIntegration('elementor')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
        >
          <HiPlus className="ml-2 -mr-1 h-5 w-5" />
          חיבור חדש
        </button>
      </div>
      
      {/* Category Tabs */}
      <CategoryTabs 
        categories={getCategories()} 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Lead Integrations */}
      {!loading && !error && (activeCategory === 'all' || activeCategory === 'leads') && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">לידים</span>
              חיבורי לידים
            </div>
            <Link 
              to="/lead-integration-instructions" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              הוראות התקנה
              <HiOutlineExternalLink className="mr-1 h-4 w-4" />
            </Link>
          </h3>
          
          <IntegrationList 
            integrations={integrations}
            category="leads"
            stores={stores}
            loading={loading}
            onEdit={handleEditIntegration}
            onDelete={handleDeleteIntegration}
            onToggle={handleToggleIntegration}
            onCreateIntegration={handleCreateIntegration}
          />
        </div>
      )}
      
      {/* Notification Integrations */}
      {!loading && !error && (activeCategory === 'all' || activeCategory === 'notifications') && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">התראות</span>
            שירותי התראות
          </h3>
          
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-gray-500">אין אינטגרציות התראות מוגדרות</p>
            <p className="text-xs text-gray-400 mt-1">יתווסף בקרוב</p>
          </div>
        </div>
      )}
      
      {/* Analytics Integrations */}
      {!loading && !error && (activeCategory === 'all' || activeCategory === 'analytics') && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">אנליטיקה</span>
              שירותי אנליטיקה
            </div>
            <Link 
              to="/analytics-integration-instructions" 
              className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-800"
            >
              הוראות התקנה
              <HiOutlineExternalLink className="mr-1 h-4 w-4" />
            </Link>
          </h3>
          
          <IntegrationList 
            integrations={integrations}
            category="analytics"
            stores={stores}
            loading={loading}
            onEdit={handleEditIntegration}
            onDelete={handleDeleteIntegration}
            onToggle={handleToggleIntegration}
            onCreateIntegration={handleCreateIntegration}
          />
        </div>
      )}
      
      {/* Payment Integrations */}
      {!loading && !error && (activeCategory === 'all' || activeCategory === 'payments') && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">תשלומים</span>
            שירותי תשלום
          </h3>
          
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-gray-500">אין אינטגרציות תשלום מוגדרות</p>
            <p className="text-xs text-gray-400 mt-1">יתווסף בקרוב</p>
          </div>
        </div>
      )}
      
      {/* Installation Instructions */}
      {!loading && !error && <InstallationInstructions />}
      
      {/* Integration Modal */}
      {showModal && (
        <IntegrationModal
          modalType={modalType}
          editingIntegration={editingIntegration}
          onSave={handleSaveIntegration}
          onCancel={handleCancelIntegration}
        />
      )}
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="מחיקת אינטגרציה"
        message={`האם אתה בטוח שברצונך למחוק את האינטגרציה "${integrationToDelete?.name}"?`}
        confirmText="מחק"
        cancelText="ביטול"
        onConfirm={confirmDeleteIntegration}
        onCancel={() => {
          setShowConfirmDialog(false);
          setIntegrationToDelete(null);
        }}
      />
    </div>
  );
};

export default IntegrationsTab;
