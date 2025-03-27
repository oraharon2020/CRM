import React from 'react';
import { 
  FaWpforms, FaFacebook, FaWix, FaChartLine, 
  FaAd, FaSearchDollar 
} from 'react-icons/fa';
import { Integration, IntegrationType } from './types';

/**
 * Returns a human-readable name for the given integration type
 */
export const getIntegrationTypeName = (type: string): string => {
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

/**
 * Creates a mock integration object for testing
 */
export const createMockIntegration = (
  idOrData: number | any,
  typeOrIntegrations?: IntegrationType | Integration[],
  name?: string,
  storeId: number | null = null,
  isEnabled: boolean = true
): Integration => {
  // Handle the case where it's called with form data and existing integrations
  if (typeof idOrData === 'object' && Array.isArray(typeOrIntegrations)) {
    const data = idOrData;
    const integrations = typeOrIntegrations;
    
    return {
      id: Math.max(...integrations.map(i => i.id), 0) + 1,
      name: data.name,
      type: data.type,
      api_key: `${data.type}_${Math.random().toString(36).substring(2, 10)}`,
      is_enabled: data.is_enabled,
      store_id: data.store_id,
      default_assignee: data.default_assignee,
      field_mapping: data.field_mapping,
      webhook_url: data.webhook_url,
      leads_count: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  // Handle the original case for creating test data
  return {
    id: idOrData as number,
    name: name as string,
    type: typeOrIntegrations as IntegrationType,
    api_key: `${typeOrIntegrations}_${Math.random().toString(36).substring(2, 10)}`,
    is_enabled: isEnabled,
    store_id: storeId,
    leads_count: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Returns mock integrations data for testing
 */
export const getMockIntegrationsData = (): Integration[] => {
  return [
    createMockIntegration(1, 'elementor', 'טופס צור קשר - אלמנטור', 1, true),
    createMockIntegration(2, 'contact-form-7', 'טופס צור קשר - CF7', null, false),
    createMockIntegration(3, 'facebook', 'לידים מפייסבוק', 2, true),
    createMockIntegration(4, 'google-analytics', 'Google Analytics', 1, true),
    createMockIntegration(5, 'google-ads', 'Google Ads', 2, false),
    createMockIntegration(6, 'facebook-ads', 'Facebook Ads', null, true),
    createMockIntegration(7, 'google-search-console', 'Google Search Console', 1, true)
  ];
};

/**
 * Returns the appropriate icon component for the given integration type
 */
export const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'elementor':
      return <FaWpforms className="h-6 w-6" />;
    case 'contact-form-7':
      return <FaWpforms className="h-6 w-6" />;
    case 'facebook':
      return <FaFacebook className="h-6 w-6" />;
    case 'custom':
      return <FaWix className="h-6 w-6" />;
    case 'google-analytics':
      return <FaChartLine className="h-6 w-6" />;
    case 'google-ads':
      return <FaAd className="h-6 w-6" />;
    case 'facebook-ads':
      return <FaFacebook className="h-6 w-6" />;
    case 'google-search-console':
      return <FaSearchDollar className="h-6 w-6" />;
    default:
      return <FaWpforms className="h-6 w-6" />;
  }
};

/**
 * Returns the appropriate background and text color classes for the given integration type
 */
export const getIntegrationIconBgColor = (type: string) => {
  switch (type) {
    case 'elementor':
      return 'bg-pink-100 text-pink-600';
    case 'contact-form-7':
      return 'bg-blue-100 text-blue-600';
    case 'facebook':
      return 'bg-indigo-100 text-indigo-600';
    case 'custom':
      return 'bg-purple-100 text-purple-600';
    case 'google-analytics':
      return 'bg-blue-100 text-blue-600';
    case 'google-ads':
      return 'bg-red-100 text-red-600';
    case 'facebook-ads':
      return 'bg-indigo-100 text-indigo-600';
    case 'google-search-console':
      return 'bg-green-100 text-green-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Returns a human-readable description for the given integration type
 */
export const getIntegrationDescription = (type: string) => {
  switch (type) {
    case 'elementor':
      return 'חיבור לטפסי אלמנטור';
    case 'contact-form-7':
      return 'חיבור לטפסי Contact Form 7';
    case 'facebook':
      return 'חיבור לטפסי לידים בפייסבוק';
    case 'custom':
      return 'חיבור מותאם אישית';
    case 'google-analytics':
      return 'חיבור ל-Google Analytics';
    case 'google-ads':
      return 'חיבור ל-Google Ads';
    case 'facebook-ads':
      return 'חיבור ל-Facebook Ads';
    case 'google-search-console':
      return 'חיבור ל-Google Search Console';
    default:
      return 'חיבור כללי';
  }
};

/**
 * Returns the store name for the given store ID
 */
export const getStoreName = (storeId: number | null, stores: any[] | undefined) => {
  if (storeId === null) return 'כל החנויות';
  const store = stores?.find(s => s.id === storeId);
  return store ? store.name : 'חנות לא ידועה';
};

/**
 * Returns the button color classes for the given integration type
 */
export const getButtonColorClasses = (type: string) => {
  if (['google-analytics', 'google-ads', 'facebook-ads', 'google-search-console'].includes(type)) {
    return {
      button: 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200',
      addButton: 'text-white bg-yellow-600 hover:bg-yellow-700'
    };
  }
  
  return {
    button: 'text-blue-700 bg-blue-100 hover:bg-blue-200',
    addButton: 'text-white bg-blue-600 hover:bg-blue-700'
  };
};

/**
 * Filters integrations by category
 */
export const filterIntegrationsByCategory = (
  integrations: Integration[], 
  category: string
): Integration[] => {
  if (category === 'all') {
    return integrations;
  } else if (category === 'leads') {
    return integrations.filter(i => 
      ['elementor', 'contact-form-7', 'facebook', 'custom'].includes(i.type)
    );
  } else if (category === 'analytics') {
    return integrations.filter(i => 
      ['google-analytics', 'google-ads', 'facebook-ads', 'google-search-console'].includes(i.type)
    );
  } else if (category === 'notifications') {
    return integrations.filter(i => 
      ['email', 'sms', 'whatsapp'].includes(i.type)
    );
  } else if (category === 'payments') {
    return integrations.filter(i => 
      ['paypal', 'stripe', 'credit-card'].includes(i.type)
    );
  }
  
  return [];
};

/**
 * Returns the available integration types for the given category
 */
export const getIntegrationTypesByCategory = (category: string): IntegrationType[] => {
  if (category === 'leads') {
    return ['elementor', 'contact-form-7', 'facebook', 'custom'];
  } else if (category === 'analytics') {
    return ['google-analytics', 'google-ads', 'facebook-ads', 'google-search-console'];
  }
  
  return ['elementor'];
};
