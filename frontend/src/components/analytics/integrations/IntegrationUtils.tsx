import { AnalyticsIntegration } from './types';

/**
 * Get integration type display name
 */
export const getIntegrationTypeDisplay = (type: string): string => {
  switch (type) {
    case 'google-analytics':
      return 'Google Analytics';
    case 'facebook-ads':
      return 'Facebook Ads';
    case 'google-ads':
      return 'Google Ads';
    case 'google-search-console':
      return 'Google Search Console';
    default:
      return type;
  }
};

/**
 * Get integration type icon
 */
export const getIntegrationTypeIcon = (type: string): string => {
  switch (type) {
    case 'google-analytics':
      return '📊';
    case 'facebook-ads':
      return '📱';
    case 'google-ads':
      return '🔍';
    case 'google-search-console':
      return '🌐';
    default:
      return '📈';
  }
};

/**
 * Format date
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'לא זמין';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

/**
 * Generate mock integrations for a store
 */
export const generateMockIntegrations = (storeId: number): AnalyticsIntegration[] => {
  return [
    {
      id: 1,
      store_id: storeId,
      name: 'Google Analytics',
      type: 'google-analytics',
      credentials: {
        tracking_id: 'UA-123456789-1',
        api_key: '********'
      },
      settings: {
        include_demographics: true,
        track_ecommerce: true
      },
      is_enabled: true,
      last_sync: {
        status: 'completed',
        start_time: '2025-03-09T12:00:00Z',
        end_time: '2025-03-09T12:05:00Z',
        records_processed: 150
      },
      created_at: '2025-03-01T10:00:00Z',
      updated_at: '2025-03-09T12:05:00Z'
    },
    {
      id: 2,
      store_id: storeId,
      name: 'Facebook Ads',
      type: 'facebook-ads',
      credentials: {
        app_id: '123456789',
        app_secret: '********',
        access_token: '********'
      },
      is_enabled: true,
      last_sync: {
        status: 'completed',
        start_time: '2025-03-09T13:00:00Z',
        end_time: '2025-03-09T13:03:00Z',
        records_processed: 75
      },
      created_at: '2025-03-02T11:00:00Z',
      updated_at: '2025-03-09T13:03:00Z'
    },
    {
      id: 3,
      store_id: storeId,
      name: 'Google Ads',
      type: 'google-ads',
      credentials: {
        client_id: 'client-id-123',
        client_secret: '********',
        refresh_token: '********',
        developer_token: '********',
        customer_id: '123-456-7890'
      },
      settings: {
        include_campaigns: true,
        include_ad_groups: true,
        include_keywords: true
      },
      is_enabled: false,
      created_at: '2025-03-03T09:00:00Z',
      updated_at: '2025-03-03T09:00:00Z'
    }
  ];
};

/**
 * Mask sensitive credentials
 */
export const maskSensitiveCredentials = (credentials: Record<string, any>): Record<string, any> => {
  const maskedCredentials: Record<string, any> = {};
  
  if (credentials) {
    Object.keys(credentials).forEach(key => {
      if (typeof credentials[key] === 'string' && 
          (key.includes('key') || key.includes('secret') || key.includes('token'))) {
        // Mask sensitive values
        const value = credentials[key];
        maskedCredentials[key] = value.length > 16 
          ? `${value.substring(0, 8)}...${value.substring(value.length - 8)}`
          : '********';
      } else {
        // Keep non-sensitive values
        maskedCredentials[key] = credentials[key];
      }
    });
  }
  
  return maskedCredentials;
};
