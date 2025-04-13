import React from 'react';
import { HiCheck, HiOutlineRefresh, HiPencil, HiTrash } from 'react-icons/hi';
import { Integration } from './types';
import { 
  getIntegrationIcon, 
  getIntegrationIconBgColor, 
  getIntegrationDescription, 
  getStoreName,
  getIntegrationTypeName,
  getButtonColorClasses
} from './IntegrationUtils';

interface IntegrationCardProps {
  integration: Integration;
  stores: any[] | undefined;
  onEdit: (integration: Integration) => void;
  onDelete: (integration: Integration) => void;
  onToggle: (integration: Integration) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  stores,
  onEdit,
  onDelete,
  onToggle
}) => {
  const isAnalyticsIntegration = [
    'google-analytics', 
    'google-ads', 
    'facebook-ads', 
    'google-search-console'
  ].includes(integration.type);
  
  const colorClasses = getButtonColorClasses(integration.type);
  
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getIntegrationIconBgColor(integration.type)}`}>
            {getIntegrationIcon(integration.type)}
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
              onClick={() => onToggle(integration)}
              className={`inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded ${colorClasses.button} focus:outline-none transition-colors duration-200`}
              title={integration.is_enabled ? 'השבת' : 'הפעל'}
            >
              <HiOutlineRefresh className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(integration)}
              className={`inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded ${colorClasses.button} focus:outline-none transition-colors duration-200`}
              title="ערוך"
            >
              <HiPencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(integration)}
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
          <p>API Key: {integration.api_key ? integration.api_key.substring(0, 8) + '...' : 'N/A'}</p>
        </div>
        {integration.leads_count !== undefined && !isAnalyticsIntegration && (
          <div className="mt-2">
            <p>לידים: {integration.leads_count}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
