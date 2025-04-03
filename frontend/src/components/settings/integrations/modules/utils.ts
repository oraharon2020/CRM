import { FaWpforms, FaFacebook, FaWix, FaChartLine, FaAd, FaSearchDollar } from 'react-icons/fa';
import { Integration } from './types';

export const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'elementor':
      return FaWpforms;
    case 'contact-form-7':
      return FaWpforms;
    case 'facebook':
      return FaFacebook;
    case 'custom':
      return FaWix;
    case 'google-analytics':
      return FaChartLine;
    case 'google-ads':
      return FaAd;
    case 'facebook-ads':
      return FaFacebook;
    case 'google-search-console':
      return FaSearchDollar;
    default:
      return FaWpforms;
  }
};

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

export const getStoreName = (storeId: number | null, stores: any[]) => {
  if (storeId === null) return 'כל החנויות';
  const store = stores?.find(s => s.id === storeId);
  return store ? store.name : 'חנות לא ידועה';
};

export const filterLeadIntegrations = (integrations: Integration[]) => {
  return integrations.filter(i => 
    ['elementor', 'contact-form-7', 'facebook', 'custom'].includes(i.type)
  );
};

export const filterAnalyticsIntegrations = (integrations: Integration[]) => {
  return integrations.filter(i => 
    ['google-analytics', 'google-ads', 'facebook-ads', 'google-search-console'].includes(i.type)
  );
};
