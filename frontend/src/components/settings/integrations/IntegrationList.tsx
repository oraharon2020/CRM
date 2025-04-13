import React from 'react';
import { Integration, IntegrationType } from './types';
import IntegrationCard from './IntegrationCard';
import AddIntegrationCard from './AddIntegrationCard';
import { filterIntegrationsByCategory } from './IntegrationUtils';

interface IntegrationListProps {
  integrations: Integration[];
  category: string;
  stores?: { id: number; name: string }[];
  loading: boolean;
  onEdit: (integration: Integration) => void;
  onDelete: (integration: Integration) => void;
  onToggle: (integration: Integration) => void;
  onCreateIntegration: (type: IntegrationType) => void;
}

const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations,
  category,
  stores,
  loading,
  onEdit,
  onDelete,
  onToggle,
  onCreateIntegration
}) => {
  const filteredIntegrations = filterIntegrationsByCategory(integrations, category);
  
  if (filteredIntegrations.length === 0 && !loading) {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500">אין אינטגרציות מוגדרות</p>
        <button
          onClick={() => onCreateIntegration('elementor')}
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
        >
          הוסף אינטגרציה
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredIntegrations.map(integration => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          stores={stores}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
      
      <AddIntegrationCard 
        category={category} 
        onCreateIntegration={onCreateIntegration} 
      />
    </div>
  );
};

export default IntegrationList;
