import React from 'react';
import { HiPlus, HiCheck, HiOutlineRefresh, HiPencil, HiTrash } from 'react-icons/hi';
import { Integration } from './types';
import { getIntegrationIcon, getIntegrationIconBgColor, getIntegrationDescription, getStoreName } from './utils';

interface LeadIntegrationsProps {
  integrations: Integration[];
  loading: boolean;
  stores: any[];
  onCreateIntegration: (type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom') => void;
  onEditIntegration: (integration: Integration) => void;
  onDeleteIntegration: (integration: Integration) => void;
  onToggleIntegration: (integration: Integration) => void;
}

const LeadIntegrations: React.FC<LeadIntegrationsProps> = ({
  integrations,
  loading,
  stores,
  onCreateIntegration,
  onEditIntegration,
  onDeleteIntegration,
  onToggleIntegration
}) => {
  // Only include lead-related integrations (elementor and contact-form-7)
  const leadIntegrations = integrations.filter(i => 
    ['elementor', 'contact-form-7'].includes(i.type)
  );
  
  if (leadIntegrations.length === 0 && !loading) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500">אין אינטגרציות לידים מוגדרות</p>
        <button
          onClick={() => onCreateIntegration('elementor')}
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
        >
          <HiPlus className="ml-2 -mr-1 h-5 w-5" />
          הוסף אינטגרציה
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leadIntegrations.map(integration => (
        <div key={integration.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getIntegrationIconBgColor(integration.type)}`}>
                {React.createElement(getIntegrationIcon(integration.type), { className: "h-6 w-6" })}
              </div>
              <div className="mr-4">
                <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                <p className="text-xs text-gray-500">{getIntegrationDescription(integration.type)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 ${
                integration.is_enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {integration.is_enabled 
                  ? <><HiCheck className="ml-1 h-3 w-3" /> פעיל</>
                  : 'לא פעיל'
                }
              </span>
              <div className="flex space-x-1 space-x-reverse">
                <button
                  type="button"
                  onClick={() => onToggleIntegration(integration)}
                  className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none transition-colors duration-200"
                  title={integration.is_enabled ? 'השבת' : 'הפעל'}
                >
                  <HiOutlineRefresh className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditIntegration(integration)}
                  className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none transition-colors duration-200"
                  title="ערוך"
                >
                  <HiPencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteIntegration(integration)}
                  className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none transition-colors duration-200"
                  title="מחק"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
            <div className="flex justify-between">
              <p>חנות: {getStoreName(integration.store_id, stores)}</p>
              <p>API Key: {integration.api_key.substring(0, 8)}...</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Add New Integration Card */}
      <div className="bg-gray-50 p-5 rounded-lg border border-dashed border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
          <HiPlus className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">הוסף אינטגרציה חדשה</h3>
        <div className="grid grid-cols-2 gap-2 w-full mt-2">
          <button
            onClick={() => onCreateIntegration('elementor')}
            className="px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none transition-colors duration-200"
          >
            אלמנטור
          </button>
          <button
            onClick={() => onCreateIntegration('contact-form-7')}
            className="px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none transition-colors duration-200"
          >
            Contact Form 7
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadIntegrations;
