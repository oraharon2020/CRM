export interface Integration {
  id: number;
  name: string;
  type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom' | 'generic' | 
        'google-analytics' | 'google-ads' | 'facebook-ads' | 'google-search-console';
  api_key: string;
  is_enabled: boolean;
  store_id: number | null;
  default_assignee?: number;
  field_mapping?: Record<string, string>;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
  leads_count?: number;
  settings?: Record<string, any>;
}

export interface Store {
  id: number;
  name: string;
  url: string;
  status: 'active' | 'inactive';
}

export type IntegrationType = 
  'elementor' | 
  'contact-form-7' | 
  'facebook' | 
  'custom' | 
  'google-analytics' | 
  'google-ads' | 
  'facebook-ads' | 
  'google-search-console';

export interface Category {
  id: string;
  name: string;
  count: number;
}
