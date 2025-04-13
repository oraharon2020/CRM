import React from 'react';
import { HiPlus } from 'react-icons/hi';
import { IntegrationType } from './types';
import { getButtonColorClasses, getIntegrationTypesByCategory } from './IntegrationUtils';

interface AddIntegrationCardProps {
  category: string;
  onCreateIntegration: (type: IntegrationType) => void;
}

const AddIntegrationCard: React.FC<AddIntegrationCardProps> = ({
  category,
  onCreateIntegration
}) => {
  const isAnalyticsCategory = category === 'analytics';
  const availableTypes = getIntegrationTypesByCategory(category === 'all' ? 'leads' : category);
  const colorClasses = getButtonColorClasses(isAnalyticsCategory ? 'google-analytics' : 'elementor');
  
  return (
    <div className="bg-gray-50 p-5 rounded-lg border border-dashed border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isAnalyticsCategory ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'} mb-3`}>
        <HiPlus className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">הוסף אינטגרציה חדשה</h3>
      <div className="grid grid-cols-2 gap-2 w-full mt-2">
        {availableTypes.map(type => (
          <button
            key={type}
            onClick={() => onCreateIntegration(type)}
            className={`px-3 py-1.5 border border-transparent text-xs font-medium rounded ${colorClasses.button} focus:outline-none transition-colors duration-200`}
          >
            {getIntegrationTypeName(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper function to get the integration type name
const getIntegrationTypeName = (type: string): string => {
  switch (type) {
    case 'elementor':
      return 'אלמנטור';
    case 'contact-form-7':
      return 'Contact Form 7';
    case 'facebook':
      return 'פייסבוק';
    case 'custom':
      return 'מותאם אישית';
    case 'google-analytics':
      return 'Google Analytics';
    case 'google-ads':
      return 'Google Ads';
    case 'facebook-ads':
      return 'Facebook Ads';
    case 'google-search-console':
      return 'Google Search Console';
    default:
      return type;
  }
};

export default AddIntegrationCard;
