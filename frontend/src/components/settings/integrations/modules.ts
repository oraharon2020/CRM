/**
 * Types and modules for integrations
 */
import WebhookApiKeyGenerator from './modules/WebhookApiKeyGenerator';

// Export components
export { WebhookApiKeyGenerator };

/**
 * Integration type
 */
export type Integration = {
  id: number;
  name: string;
  type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom' | 'generic' | 'google-analytics' | 'google-ads' | 'facebook-ads' | 'google-search-console' | 'multi-supplier-manager';
  store_id: number | null;
  is_enabled: boolean;
  config: any;
  created_at?: string;
  updated_at?: string;
};

/**
 * Category item type
 */
export type CategoryItem = {
  id: string;
  name: string;
  count: number;
};
